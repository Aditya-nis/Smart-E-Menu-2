from django.contrib import admin

from menu.models import FoodCategory, FoodMenu

@admin.register(FoodCategory)
class FoodCategoryAdmin(admin.ModelAdmin):
    list_display = ("FoodCategoryId", "FoodCategoryName", "FoodCategoryIcon", "FoodCategoryDescription")
    search_fields = ("FoodCategoryName",)

@admin.register(FoodMenu)
class FoodMenuAdmin(admin.ModelAdmin):
    list_display = ("FoodItemId", "FoodItemName", "category", "FoodItemType", "FoodItemPrice", "FoodItemRating", "FoodPreparationTime", "FoodItemAvailable")
    list_filter = ("category", "FoodItemType", "FoodItemAvailable")
    search_fields = ("FoodItemName", "FoodItemDescription", "FoodItemIngredients")