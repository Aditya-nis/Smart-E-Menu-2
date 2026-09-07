from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.db.models import Q
from menu.models import FoodCategory, FoodMenu
from Kitchen.models import FoodOrder
from Account.models import UserInformation
from Tables.models import SeatBooking


def home(request):
    category = FoodCategory.objects.all()
    FoodItemInfo = FoodMenu.objects.filter(FoodItemAvailable=True).select_related('category')
    
    # User's active table
    current_table = request.session.get('selected_table', 'Table 4')

    context = {
        "FoodItemInfo": FoodItemInfo,
        "category": category,
        "current_table": current_table,
    }

    return render(request, "index.html", {"context": context, "FoodItemInfo": FoodItemInfo, "category": category, "current_table": current_table})


def menu(request):
    selected_category = request.GET.get("category", "All").strip()
    selected_diet = request.GET.get("diet", "all").strip()
    search_query = request.GET.get("q", "").strip()

    categories = FoodCategory.objects.all()
    items_qs = FoodMenu.objects.filter(FoodItemAvailable=True).select_related('category')

    if selected_category != "All":
        items_qs = items_qs.filter(category__FoodCategoryName__iexact=selected_category)

    if selected_diet == "veg":
        items_qs = items_qs.filter(FoodItemType__iexact="veg")
    elif selected_diet == "non-veg":
        items_qs = items_qs.filter(FoodItemType__iexact="Non-Veg")

    if search_query:
        items_qs = items_qs.filter(
            Q(FoodItemName__icontains=search_query) |
            Q(FoodItemDescription__icontains=search_query) |
            Q(FoodItemIngredients__icontains=search_query)
        )

    context = {
        "FoodItemInfo": list(items_qs),
        "categories": categories,
        "selected_category": selected_category,
        "selected_diet": selected_diet,
        "search_query": search_query,
    }

    return render(request, 'menu.html', context)


def category(request):
    categories = FoodCategory.objects.all()
    return render(request, 'menu.html', {"categories": categories})


def food_detail(request, id):
    food_item = get_object_or_404(FoodMenu, FoodItemId=id)

    data = {
        "id": food_item.FoodItemId,
        "name": food_item.FoodItemName,
        "category": food_item.category.FoodCategoryName if food_item.category else "Main",
        "type": food_item.FoodItemType,
        "price": float(food_item.FoodItemPrice),
        "rating": float(food_item.FoodItemRating),
        "prepTime": food_item.FoodPreparationTime,
        "image": food_item.FoodItemImage,
        "description": food_item.FoodItemDescription,
        "ingredients": food_item.FoodItemIngredients,
        "available": food_item.FoodItemAvailable,
    }
    return JsonResponse(data)


def order_tracking(request):
    active_order = None
    if "user_id" in request.session:
        user_id = request.session["user_id"]
        active_order = FoodOrder.objects.filter(
            User_id=user_id
        ).select_related("Table", "User").prefetch_related("items__FoodItem").order_by("-OrderDateTime").first()

    context = {
        "active_order": active_order
    }
    return render(request, 'order-tracking.html', context)


def dashboard(request):
    category = FoodCategory.objects.all()
    FoodItemInfo = FoodMenu.objects.filter(FoodItemAvailable=True).select_related('category')
    current_table = request.session.get('selected_table', 'Table 4')

    context = {
        "FoodItemInfo": FoodItemInfo,
        "category": category,
        "current_table": current_table
    }
    return render(request, 'dashboard.html', context)


def test(request):
    return render(request, 'sample.html')