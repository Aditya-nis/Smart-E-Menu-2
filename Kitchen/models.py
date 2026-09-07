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

    SubtotalAmount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00
    )

    GstAmount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00
    )

    DiscountAmount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00
    )

    TotalAmount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00
    )

    PaymentStatus = models.CharField(
        max_length=20,
        choices=[
            ("Pending", "Pending"),
            ("Paid", "Paid"),
            ("Refunded", "Refunded"),
        ],
        default="Pending"
    )

    PaymentMethod = models.CharField(
        max_length=20,
        choices=[
            ("UPI", "UPI"),
            ("Card", "Card"),
            ("Cash", "Cash"),
            ("NetBanking", "NetBanking"),
        ],
        default="UPI"
    )

    def __str__(self):
        return f"Order #{self.OrderId} - {self.User.UserName} ({self.Table.TableName})"


class FoodOrderItem(models.Model):
    OrderItemId = models.AutoField(primary_key=True)
    Order = models.ForeignKey(
        FoodOrder,
        on_delete=models.CASCADE,
        related_name="items"
    )
    FoodItem = models.ForeignKey(
        'menu.FoodMenu',
        on_delete=models.CASCADE,
        related_name="order_items"
    )
    Quantity = models.IntegerField(default=1)
    ItemPrice = models.DecimalField(
        max_digits=8,
        decimal_places=2
    )
    SpecialInstructions = models.TextField(
        blank=True,
        null=True,
        default=""
    )

    def __str__(self):
        return f"{self.Quantity}x {self.FoodItem.FoodItemName} (Order #{self.Order.OrderId})"