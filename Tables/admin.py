from django.contrib import admin

from Tables.models import HotelTables, SeatBooking

# Register your models here.
admin.site.register(HotelTables)
admin.site.register(SeatBooking)