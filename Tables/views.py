from django.shortcuts import render, get_object_or_404
from django.shortcuts import redirect
from django.contrib import messages
from django.utils import timezone
from requests import session

from Tables.models import HotelTables, SeatBooking


def tables(request):


    # fetch all required data from database
    TableInfo=HotelTables.objects.all()



    for table in TableInfo:
        table.features = [f.strip() for f in table.TableFeatures.split(",")]



    # to get total count of seats in hotel
    total_seat = HotelTables.objects.count()

    # to Get Count of Available seat and Count
    available_seat = HotelTables.objects.filter(
         TablesStatus="Available"

    ).count()

    # To get Count Of Reserved Tables from Database
    reserved_seat = HotelTables.objects.filter(
        TablesStatus="Reserved"
    ).count()

    # To get Count f Occupied table from Database
    occupied_seat = HotelTables.objects.filter(
        TablesStatus="Occupied"

    ).count()


    context = {
        "total_seat": total_seat,
        "available_seat": available_seat,
        "occupied_seat": occupied_seat,
        "reserved_seat": reserved_seat,
        "TableInfo" : TableInfo

    }


    return render(request,'tables.html',context)


def BookSeat(request, id):

    # Check login
    if "user_id" not in request.session:
        return redirect("login")

    userid = request.session["user_id"]

    # Check if user already has a reserved table
    booking = SeatBooking.objects.filter(
        User_id=userid,
        SeatBookingStatus="Reserved"
    ).exists()

    if booking:
        messages.error(request, "You already booked a seat.")
        return redirect("tables")

    # Get table
    table = get_object_or_404(HotelTables, TableId=id)

    # Create booking
    SeatBooking.objects.create(
        User_id=userid,
        Table=table,
        BookingDateTime=timezone.now(),
        SeatBookingStatus="Reserved"
    )

    # Update table status
    table.TablesStatus = "Occupied"
    table.save()

    messages.success(request, "Seat booked successfully.")

    return redirect("tables")
