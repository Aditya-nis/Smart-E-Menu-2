from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.utils import timezone
from Account.models import UserInformation
from Tables.models import HotelTables, SeatBooking


def tables(request):
    selected_zone = request.GET.get("zone", "all").strip()
    selected_status = request.GET.get("status", "all").strip()

    tables_qs = HotelTables.objects.all()

    if selected_zone != "all":
        tables_qs = tables_qs.filter(TableZone__iexact=selected_zone)

    if selected_status == "available":
        tables_qs = tables_qs.filter(TablesStatus="Available")
    elif selected_status != "all":
        tables_qs = tables_qs.filter(TablesStatus__iexact=selected_status)

    TableInfo = list(tables_qs)
    for table in TableInfo:
        if table.TableFeatures:
            table.features = [f.strip() for f in table.TableFeatures.split(",") if f.strip()]
        else:
            table.features = []

    # Quick stats
    total_seat = HotelTables.objects.count()
    available_seat = HotelTables.objects.filter(TablesStatus="Available").count()
    occupied_seat = HotelTables.objects.filter(TablesStatus="Occupied").count()
    reserved_seat = HotelTables.objects.filter(TablesStatus="Reserved").count()

    # Current user active booking
    current_user_table = None
    if "user_id" in request.session:
        try:
            user = UserInformation.objects.get(UserId=request.session["user_id"])
            active_booking = SeatBooking.objects.filter(
                User=user,
                SeatBookingStatus__in=["Reserved", "Occupied"]
            ).select_related("Table").first()
            if active_booking:
                current_user_table = active_booking.Table
                request.session['selected_table'] = active_booking.Table.TableName
        except UserInformation.DoesNotExist:
            pass

    context = {
        "total_seat": total_seat,
        "available_seat": available_seat,
        "occupied_seat": occupied_seat,
        "reserved_seat": reserved_seat,
        "TableInfo": TableInfo,
        "selected_zone": selected_zone,
        "selected_status": selected_status,
        "current_user_table": current_user_table,
    }

    return render(request, 'tables.html', context)


def BookSeat(request, id):
    if "user_id" not in request.session:
        messages.error(request, "Please log in to book a restaurant table.")
        return redirect("login")

    userid = request.session["user_id"]
    user = get_object_or_404(UserInformation, UserId=userid)

    # Check if user already has an active table booking
    active_booking = SeatBooking.objects.filter(
        User=user,
        SeatBookingStatus__in=["Reserved", "Occupied"]
    ).exists()

    if active_booking:
        messages.error(request, "You already have an active table booking. You cannot book multiple tables at the same time.")
        return redirect("tables")

    table = get_object_or_404(HotelTables, TableId=id)

    if table.TablesStatus != "Available":
        messages.error(request, f"{table.TableName} is currently unavailable for booking.")
        return redirect("tables")

    # Create seat booking record
    SeatBooking.objects.create(
        User=user,
        Table=table,
        BookingDateTime=timezone.now(),
        SeatBookingStatus="Reserved"
    )

    # Update table status to Occupied
    table.TablesStatus = "Occupied"
    table.save()

    request.session['selected_table'] = table.TableName

    messages.success(request, f"Successfully booked {table.TableName} ({table.TableZoneLabel})!")
    return redirect("tables")

