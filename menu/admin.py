from django.contrib import admin

from menu.models import FoodCategory, FoodMenu

# To Register the Food Category .
admin.site.register(FoodCategory)

# To Register the Menu Item
admin.site.register(FoodMenu)