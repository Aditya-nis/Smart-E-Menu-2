from django.utils import timezone
from django.db import models
from Account.models import UserInformation


# Create your models here.
# database model for Tables Management
class HotelTables(models.Model):
    # here we create the primary key
    TableId =models.AutoField(primary_key=True)
    TableName=models.CharField(max_length=20 , unique=True)
    TableZone= models.CharField(
        max_length=20,
        choices=[
            ("Indoor","Indoor"),
            ("Garden","Garden"),
            ("Rooftop","Rooftop"),
            ("VIP","VIP"),
        ]
    )
    TableZoneLabel=models.CharField(
        max_length=20,
        choices=[
            ("Main Hall (AC)","Main Hall (AC)"),
            ("Garden Patio","Garden Patio"),
            ("VIP Lounge","VIP Lounge"),
            ("Rooftop Terrace","Rooftop Terrace"),
        ]
    )
    TableSeatSize=models.CharField(
        max_length=10,
        choices=[
            ("1","1"),
            ("2","2"),
            ("3","3"),
            ("4","4"),
            ("5","5"),
            ("6","6"),
            ("7","7"),
            ("8","8"),
            ("9","9"),
            ("10","10"),

        ]

    )

    TablesStatus=models.CharField(
        max_length=20,
        choices=[
            ("Available","Available"),
            ("Occupied","Occupied"),
            ("Reserved", "Reserved"),

        ]
    )
    TableFeatures=models.TextField(max_length=30)

    def __str__(self):
         return self.TableName

# database table for managing Booking Activity
class SeatBooking(models.Model):
    SeatBookingId=models.AutoField(primary_key=True)
    User = models.ForeignKey(UserInformation, on_delete=models.CASCADE)
    Table = models.ForeignKey(HotelTables, on_delete=models.CASCADE)
    BookingDateTime=models.DateTimeField(default=timezone.now)
    SeatBookingStatus=models.CharField(
        choices=[
            ("Available","Available"),
            ("Reserved","Reserved"),
            ("NotAvailable","NotAvailable"),
            ("Canceled", "Canceled"),
            ("Completed", "Completed"),

        ]
    )

    def __str__(self):
        return f"Booking #{self.SeatBookingId} - {self.User.UserName} ({self.Table.TableName})"

