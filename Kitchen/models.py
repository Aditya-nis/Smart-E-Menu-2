from django.db import models
from Account.models import UserInformation
from Tables.models import HotelTables



class FoodOrder(models.Model):

    OrderId = models.AutoField(primary_key=True)

    User = models.ForeignKey(
        UserInformation,
        on_delete=models.CASCADE,
        related_name="orders"
    )

    Table = models.ForeignKey(
        HotelTables,
        on_delete=models.PROTECT,
        related_name="orders"
    )

    OrderDateTime = models.DateTimeField(
        auto_now_add=True
    )

    OrderStatus = models.CharField(
        max_length=20,
        choices=[
            ("Received", "Received"),
            ("Accepted", "Accepted"),
            ("Preparing", "Preparing"),
            ("Cooking", "Cooking"),
            ("Ready", "Ready"),
            ("Served", "Served"),
            ("Completed", "Completed"),
            ("Canceled", "Canceled"),
        ],
        default="Received"
    )

    SpecialInstructions = models.TextField(
        blank=True,
        null=True
    )

    def __str__(self):
        return f"Order #{self.OrderId}"