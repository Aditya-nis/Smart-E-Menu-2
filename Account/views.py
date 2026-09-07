from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from .models import UserInformation
from Tables.models import SeatBooking
from Kitchen.models import FoodOrder


def login_view(request):
    if request.method == "POST":
        email = request.POST.get("LoginEmail", "").strip()
        password = request.POST.get("Password", "").strip()

        if not email or not password:
            messages.error(request, "Please enter both Email and Password.")
            return render(request, "login.html")

        try:
            user = UserInformation.objects.get(
                UserEmailAddress__iexact=email,
                UserPassword=password
            )

            request.session["user_id"] = user.UserId
            request.session["email"] = user.UserEmailAddress
            request.session["name"] = user.UserName
            request.session["role"] = user.UserRole
            request.session.set_expiry(10800)

            messages.success(request, f"Welcome back, {user.UserName}!")
            return redirect("home")

        except UserInformation.DoesNotExist:
            messages.error(request, "Invalid Email or Password.")
            return render(request, "login.html")

    return render(request, 'login.html')


def logout_view(request):
    request.session.flush()
    messages.info(request, "Logged out successfully.")
    return redirect("login")


def signup_view(request):
    if request.method == "POST":
        UserName = request.POST.get("UserFullName", "").strip()
        UserEmail = request.POST.get("SignUpEmail", "").strip()
        UserPhoneNo = request.POST.get("Phone", "").strip()
        UserPassword = request.POST.get("SignUpPassword", "")
        UserConfirmPassword = request.POST.get("SignUpConfirmPassword", "")

        if not UserName or not UserEmail or not UserPhoneNo or not UserPassword:
            messages.error(request, "All required fields must be filled.")
            return render(request, 'signup.html')

        if UserConfirmPassword and UserPassword != UserConfirmPassword:
            messages.error(request, "Passwords do not match.")
            return render(request, 'signup.html')

        if UserInformation.objects.filter(UserName__iexact=UserName).exists():
            messages.error(request, "Username is already taken. Please choose another.")
            return render(request, 'signup.html')

        if UserInformation.objects.filter(UserEmailAddress__iexact=UserEmail).exists():
            messages.error(request, "Email address is already registered.")
            return render(request, 'signup.html')

        if UserInformation.objects.filter(UserContact__iexact=UserPhoneNo).exists():
            messages.error(request, "Phone number is already registered.")
            return render(request, 'signup.html')

        UserInformation.objects.create(
            UserName=UserName,
            UserEmailAddress=UserEmail,
            UserContact=UserPhoneNo,
            UserPassword=UserPassword,
            UserRole="Customer"
        )

        messages.success(request, "Your account has been created successfully. Please login.")
        return redirect("login")

    return render(request, 'signup.html')


def profile_view(request):
    if "user_id" not in request.session:
        messages.error(request, "Please log in to view your profile.")
        return redirect("login")

    Userid = request.session.get("user_id")
    UserInfo = get_object_or_404(UserInformation, UserId=Userid)

    # Fetch active booked table
    active_booking = SeatBooking.objects.filter(
        User=UserInfo,
        SeatBookingStatus="Reserved"
    ).select_related("Table").first()

    # Fetch user order history
    user_orders = FoodOrder.objects.filter(
        User=UserInfo
    ).select_related("Table").prefetch_related("items__FoodItem").order_order_by("-OrderDateTime") if hasattr(FoodOrder.objects, 'order_order_by') else FoodOrder.objects.filter(User=UserInfo).select_related("Table").prefetch_related("items__FoodItem").order_by("-OrderDateTime")

    context = {
        "UserInfo": UserInfo,
        "active_booking": active_booking,
        "user_orders": user_orders,
    }

    return render(request, "profile.html", context)


