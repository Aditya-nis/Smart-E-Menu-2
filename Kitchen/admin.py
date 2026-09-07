from django.contrib import admin

from Kitchen.models import FoodOrder, FoodOrderItem

class FoodOrderItemInline(admin.TabularInline):
    model = FoodOrderItem
    extra = 0

@admin.register(FoodOrder)
class FoodOrderAdmin(admin.ModelAdmin):
    list_display = ("OrderId", "User", "Table", "OrderStatus", "OrderDateTime", "TotalAmount", "PaymentStatus", "PaymentMethod")
    list_filter = ("OrderStatus", "PaymentStatus", "PaymentMethod", "OrderDateTime")
    search_fields = ("User__UserName", "Table__TableName", "OrderId")
    inlines = [FoodOrderItemInline]

@admin.register(FoodOrderItem)
class FoodOrderItemAdmin(admin.ModelAdmin):
    list_display = ("OrderItemId", "Order", "FoodItem", "Quantity", "ItemPrice", "SpecialInstructions")
    search_fields = ("Order__OrderId", "FoodItem__FoodItemName")