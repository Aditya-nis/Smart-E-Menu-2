import json
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.contrib import messages
from Kitchen.models import FoodOrder


def bill(request):
    raw_order_id = request.GET.get("order_id") or request.session.get("active_order_id")

    order = None
    if raw_order_id:
        clean_id = str(raw_order_id).replace("ORD-", "").strip()
        if clean_id.isdigit():
            order = FoodOrder.objects.filter(OrderId=int(clean_id)).select_related("User", "Table").prefetch_related("items__FoodItem").first()

    if not order and "user_id" in request.session:
        user_id = request.session["user_id"]
        order = FoodOrder.objects.filter(User_id=user_id).select_related("User", "Table").prefetch_related("items__FoodItem").order_by("-OrderDateTime").first()

    if not order:
        order = FoodOrder.objects.select_related("User", "Table").prefetch_related("items__FoodItem").order_by("-OrderDateTime").first()

    context = {
        "order": order
    }
    return render(request, 'bill.html', context)


def payment(request):
    if request.method == "POST":
        target_id = None
        method = "UPI"

        if request.content_type == 'application/json':
            try:
                body = json.loads(request.body)
                target_id = body.get("order_id")
                method = body.get("payment_method", "UPI")
            except json.JSONDecodeError:
                pass
        else:
            target_id = request.POST.get("order_id")
            method = request.POST.get("payment_method", "UPI")

        if not target_id:
            target_id = request.session.get("active_order_id")

        if isinstance(target_id, str) and target_id.startswith("ORD-"):
            target_id = target_id.replace("ORD-", "")

        if not target_id:
            return JsonResponse({"status": "error", "message": "No order specified"}, status=400)

        order = get_object_or_404(FoodOrder, OrderId=target_id)
        order.PaymentStatus = "Paid"
        order.PaymentMethod = method
        order.save()

        if request.headers.get('x-requested-with') == 'XMLHttpRequest' or request.content_type == 'application/json':
            return JsonResponse({
                "status": "success",
                "message": f"Payment of ₹{order.TotalAmount} received via {method}!",
                "order_id": order.OrderId,
                "payment_status": "Paid"
            })

        messages.success(request, f"Payment for Order #ORD-{order.OrderId} marked as Paid via {method}.")
        return redirect("bill")

    return redirect("bill")


def invoice(request):
    return bill(request)