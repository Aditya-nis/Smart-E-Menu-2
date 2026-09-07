import json
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.contrib import messages
from Kitchen.models import FoodOrder


def kitchen_dashboard(request):
    status_filter = request.GET.get("status", "All").strip()

    orders_qs = FoodOrder.objects.select_related("User", "Table").prefetch_related("items__FoodItem").order_by("-OrderDateTime")

    if status_filter != "All":
        orders_qs = orders_qs.filter(OrderStatus__iexact=status_filter)
    else:
        # Exclude completed orders by default in active kitchen view
        orders_qs = orders_qs.exclude(OrderStatus="Completed")

    orders = list(orders_qs)

    context = {
        "orders": orders,
        "status_filter": status_filter,
    }

    return render(request, 'kitchen-dashboard.html', context)


def pending_orders(request):
    orders_qs = FoodOrder.objects.filter(
        OrderStatus__in=["Received", "Accepted", "Preparing", "Cooking"]
    ).select_related("User", "Table").prefetch_related("items__FoodItem").order_by("-OrderDateTime")

    orders_data = []
    for order in orders_qs:
        orders_data.append({
            "order_id": f"ORD-{order.OrderId}",
            "raw_id": order.OrderId,
            "table": order.Table.TableName,
            "customer": order.User.UserName,
            "status": order.OrderStatus,
            "time": order.OrderDateTime.strftime("%I:%M %p"),
            "items_count": order.items.count(),
            "special_instructions": order.SpecialInstructions,
            "items": [
                {
                    "name": item.FoodItem.FoodItemName,
                    "qty": item.Quantity,
                    "price": float(item.ItemPrice),
                    "note": item.SpecialInstructions
                }
                for item in order.items.all()
            ]
        })

    return JsonResponse({"status": "success", "orders": orders_data})


def update_status(request, order_id=None):
    if request.method == "POST":
        new_status = ""
        target_id = order_id

        if request.content_type == 'application/json':
            try:
                body = json.loads(request.body)
                new_status = body.get("status") or body.get("new_status", "")
                if not target_id:
                    target_id = body.get("order_id")
            except json.JSONDecodeError:
                pass
        else:
            new_status = request.POST.get("status") or request.POST.get("new_status", "")
            if not target_id:
                target_id = request.POST.get("order_id")

        if isinstance(target_id, str) and target_id.startswith("ORD-"):
            target_id = target_id.replace("ORD-", "")

        if not target_id or not new_status:
            return JsonResponse({"status": "error", "message": "Missing order ID or status"}, status=400)

        order = get_object_or_404(FoodOrder, OrderId=target_id)

        valid_statuses = ["Received", "Accepted", "Preparing", "Cooking", "Ready", "Served", "Completed", "Canceled"]
        if new_status not in valid_statuses:
            return JsonResponse({"status": "error", "message": "Invalid status value"}, status=400)

        order.OrderStatus = new_status
        order.save()

        if request.headers.get('x-requested-with') == 'XMLHttpRequest' or request.content_type == 'application/json':
            return JsonResponse({
                "status": "success",
                "message": f"Order #{order.OrderId} updated to {new_status}",
                "order_id": order.OrderId,
                "new_status": new_status
            })

        messages.success(request, f"Order #ORD-{order.OrderId} status changed to {new_status}.")
        return redirect("kitchen_dashboard")

    return redirect("kitchen_dashboard")