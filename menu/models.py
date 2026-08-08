from django.db import models

# Create your models here.

# for the Food Category class
class FoodCategory(models.Model):

    # Use the FoodCategory as The Primary key
    FoodCategoryId=models.AutoField(primary_key=True)


    FoodCategoryName = models.CharField(
        max_length=20,
        choices=[
            ("Starters", "Starters"),
            ("Pure-Veg", "Veg-Veg"),
            ("Non-Veg", "Non-Veg"),
            ("Drinks & Shakes", "Drinks & Shakes")
        ]
    )
    FoodCategoryIcon=models.CharField(max_length=20)

    FoodCategoryDescription=models.TextField(max_length=30)

    def __str__(self):
        return self.FoodCategoryName


class FoodMenu(models.Model):
    FoodItemId=models.AutoField(primary_key = True)
    FoodItemName=models.CharField(max_length = 50)
    category=models.ForeignKey(
        FoodCategory,
        on_delete=models.CASCADE
    )

    FoodItemType=models.CharField(
        max_length=40,
        choices=[
            ("veg","veg"),
            ("Non-Veg", "Non-Veg"),
        ]
    )
    FoodItemPrice=models.DecimalField(
        max_digits=8,
        decimal_places=2
    )
    FoodItemRating=models.DecimalField(
        max_digits=2,
        decimal_places=1,
        default=0
    )
    FoodPreparationTime = models.CharField(max_length=20)
    FoodItemImage=models.URLField(
        max_length=650
    )
    FoodItemDescription=models.TextField(max_length=150)
    FoodItemIngredients=models.TextField(max_length=150)
    FoodItemAvailable=models.BooleanField(default=True)

    def __str__(self):
        return self.FoodItemName




