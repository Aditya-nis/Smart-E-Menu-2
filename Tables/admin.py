from django.contrib import admin

from Tables.models import HotelTables, SeatBooking

@admin.register(HotelTables)
class HotelTablesAdmin(admin.ModelAdmin):
    list_display = ("TableId", "TableName", "TableZone", "TableZoneLabel", "TableSeatSize", "TablesStatus", "TableFeatures")
    list_filter = ("TableZone", "TablesStatus")
    search_fields = ("TableName", "TableZoneLabel", "TableFeatures")

@admin.register(SeatBooking)
class SeatBookingAdmin(admin.ModelAdmin):
    list_display = ("SeatBookingId", "User", "Table", "BookingDateTime", "SeatBookingStatus")
    list_filter = ("SeatBookingStatus", "BookingDateTime")
    search_fields = ("User__UserName", "Table__TableName")