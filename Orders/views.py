import json
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.contrib import messages
from django.utils import timezone
from Account.models import UserInformation
from Tables.models import HotelTables, SeatBooking
from menu.models import FoodMenu
from Kitchen.models import FoodOrder, FoodOrderItem


def cart(request):
    if "user_id" not in request.session:
        messages.error(request, "Please log in to view your cart and order food.")
        return redirect("login")

    cart_dict = request.session.get("cart", {})
    cart_items = []
    subtotal = 0

    for food_id, item_data in cart_dict.items():
        try:
            food_item = FoodMenu.objects.get(FoodItemId=food_id)
            qty = int(item_data.get("qty", 1))
            special_note = item_data.get("special_note", "")
            item_price = float(food_item.FoodItemPrice)
            item_total = item_price * qty
            subtotal += item_total

            cart_items.append({
                "id": food_item.FoodItemId,
                "name": food_item.FoodItemName,
                "price": item_price,
                "qty": qty,
                "item_total": item_total,
                "image": food_item.FoodItemImage,
                "type": food_item.FoodItemType,
                "special_note": special_note,
            })
        except FoodMenu.DoesNotExist:
            continue

    gst = round(subtotal * 0.05, 2)
    discount = float(request.session.get("applied_discount", 0.0))
    grand_total = max(0.0, round(subtotal + gst - discount, 2))

    user_id = request.session.get("user_id")
    active_booking = SeatBooking.objects.filter(
        User_id=user_id,
        SeatBookingStatus__in=["Reserved", "Occupied"]
    ).select_related("Table").first()

    current_table = active_booking.Table if active_booking else None
    table_name = current_table.TableName if current_table else request.session.get("selected_table", "Table 4")

    context = {
        "cart_items": cart_items,
        "subtotal": subtotal,
        "gst": gst,
        "discount": discount,
        "grand_total": grand_total,
        "current_table": current_table,
        "table_name": table_name,
    }

    return render(request, 'cart.html', context)


def add_to_cart(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            food_id = str(data.get("food_id"))
            qty = int(data.get("qty", 1))
            special_note = data.get("special_note", "").strip()
        except (json.JSONDecodeError, ValueError, TypeError):
            food_id = str(request.POST.get("food_id"))
            qty = int(request.POST.get("qty", 1))
            special_note = request.POST.get("special_note", "").strip()

        if not food_id or food_id == 'None':
            return JsonResponse({"status": "error", "message": "Invalid Food ID"}, status=400)

        cart_dict = request.session.get("cart", {})

        if food_id in cart_dict:
            cart_dict[food_id]["qty"] += qty
            if special_note:
                cart_dict[food_id]["special_note"] = special_note
        else:
            cart_dict[food_id] = {
                "qty": qty,
                "special_note": special_note
            }

        request.session["cart"] = cart_dict
        request.session.modified = True

        total_count = sum(item["qty"] for item in cart_dict.values())

        if request.headers.get('x-requested-with') == 'XMLHttpRequest' or request.content_type == 'application/json':
            return JsonResponse({"status": "success", "cart_count": total_count})

        messages.success(request, "Item added to cart.")
        return redirect("cart")

    return redirect("menu")


def remove_cart(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            food_id = str(data.get("food_id"))
        except (json.JSONDecodeError, ValueError, TypeError):
            food_id = str(request.POST.get("food_id"))

        cart_dict = request.session.get("cart", {})
        if food_id in cart_dict:
            del cart_dict[food_id]
            request.session["cart"] = cart_dict
            request.session.modified = True

        if request.headers.get('x-requested-with') == 'XMLHttpRequest' or request.content_type == 'application/json':
            return JsonResponse({"status": "success", "cart_count": sum(item["qty"] for item in cart_dict.values())})

        messages.info(request, "Item removed from cart.")
        return redirect("cart")

    return redirect("cart")


def update_cart_qty(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            food_id = str(data.get("food_id"))
            delta = int(data.get("delta", 0))
        except (json.JSONDecodeError, ValueError, TypeError):
            food_id = str(request.POST.get("food_id"))
            delta = int(request.POST.get("delta", 0))

        cart_dict = request.session.get("cart", {})
        if food_id in cart_dict:
            cart_dict[food_id]["qty"] += delta
            if cart_dict[food_id]["qty"] <= 0:
                del cart_dict[food_id]
            request.session["cart"] = cart_dict
            request.session.modified = True

        return JsonResponse({"status": "success", "cart_count": sum(item["qty"] for item in cart_dict.values())})

    return JsonResponse({"status": "error", "message": "Invalid request"}, status=400)


def place_order(request):
    if "user_id" not in request.session:
        if request.headers.get('x-requested-with') == 'XMLHttpRequest' or request.content_type == 'application/json':
            return JsonResponse({"status": "error", "message": "Please login to place an order."}, status=401)
        messages.error(request, "Please log in to place an order.")
        return redirect("login")

    user_id = request.session["user_id"]
    user = get_object_or_404(UserInformation, UserId=user_id)

    # Find active seat booking or fallback to table name
    active_booking = SeatBooking.objects.filter(
        User=user,
        SeatBookingStatus__in=["Reserved", "Occupied"]
    ).select_related("Table").first()

    table = None
    if active_booking:
        table = active_booking.Table
    else:
        table_name = request.session.get("selected_table", "Table 4")
        table = HotelTables.objects.filter(TableName__iexact=table_name).first()
        if not table:
            table = HotelTables.objects.first()

    if not table:
        if request.headers.get('x-requested-with') == 'XMLHttpRequest' or request.content_type == 'application/json':
            return JsonResponse({"status": "error", "message": "No dining table found. Please select a table first."}, status=400)
        messages.error(request, "Please select an available dining table first.")
        return redirect("tables")

    # Read cart from session or request body JSON
    cart_dict = request.session.get("cart", {})
    order_notes = ""

    if request.method == "POST":
        if request.content_type == 'application/json':
            try:
                body = json.loads(request.body)
                order_notes = body.get("special_instructions", "")
                json_items = body.get("items", [])
                if json_items and isinstance(json_items, list):
                    for item in json_items:
                        fid = str(item.get("id"))
                        fqty = int(item.get("qty", 1))
                        fnote = item.get("specialNote", "")
                        if fid:
                            cart_dict[fid] = {"qty": fqty, "special_note": fnote}
            except json.JSONDecodeError:
                pass
        else:
            order_notes = request.POST.get("special_instructions", "")

    if not cart_dict:
        if request.headers.get('x-requested-with') == 'XMLHttpRequest' or request.content_type == 'application/json':
            return JsonResponse({"status": "error", "message": "Your cart is empty!"}, status=400)
        messages.error(request, "Your cart is empty!")
        return redirect("cart")

    subtotal = 0
    order_items_to_create = []

    for food_id, item_data in cart_dict.items():
        try:
            food_item = FoodMenu.objects.get(FoodItemId=food_id)
            qty = int(item_data.get("qty", 1))
            special_note = item_data.get("special_note", "")
            item_price = float(food_item.FoodItemPrice)
            subtotal += item_price * qty

            order_items_to_create.append({
                "food_item": food_item,
                "qty": qty,
                "price": item_price,
                "note": special_note
            })
        except FoodMenu.DoesNotExist:
            continue

    if not order_items_to_create:
        return JsonResponse({"status": "error", "message": "No valid food items in cart"}, status=400)

    gst = round(subtotal * 0.05, 2)
    discount = float(request.session.get("applied_discount", 0.0))
    grand_total = max(0.0, round(subtotal + gst - discount, 2))

    # Create FoodOrder
    order = FoodOrder.objects.create(
        User=user,
        Table=table,
        OrderStatus="Received",
        SpecialInstructions=order_notes,
        SubtotalAmount=subtotal,
        GstAmount=gst,
        DiscountAmount=discount,
        TotalAmount=grand_total,
        PaymentStatus="Pending",
        PaymentMethod="UPI"
    )

    # Create FoodOrderItems
    for oi in order_items_to_create:
        FoodOrderItem.objects.create(
            Order=order,
            FoodItem=oi["food_item"],
            Quantity=oi["qty"],
            ItemPrice=oi["price"],
            SpecialInstructions=oi["note"]
        )

    # Clear cart session
    request.session["cart"] = {}
    request.session["active_order_id"] = order.OrderId
    request.session.modified = True

    if request.headers.get('x-requested-with') == 'XMLHttpRequest' or request.content_type == 'application/json':
        return JsonResponse({
            "status": "success",
            "message": "Order placed successfully!",
            "order_id": f"ORD-{order.OrderId}",
            "raw_id": order.OrderId
        })

    messages.success(request, f"Order #ORD-{order.OrderId} sent to kitchen!")
    return redirect("order-tracking")


def order_history(request):
    if "user_id" not in request.session:
        messages.error(request, "Please log in to view your order history.")
        return redirect("login")

    user_id = request.session["user_id"]
    orders = FoodOrder.objects.filter(
        User_id=user_id
    ).select_related("Table").prefetch_related("items__FoodItem").order_by("-OrderDateTime")

    return render(request, 'profile.html', {"user_orders": orders})