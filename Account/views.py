from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib import messages
from urllib3 import request

from .models import UserInformation

def login_view(request):

    if request.method == "POST":

        email = request.POST["LoginEmail"]
        password = request.POST["Password"]

        try:
            user = UserInformation.objects.get(
                UserEmailAddress=email,
                UserPassword=password
            )

            request.session["user_id"] = user.UserId
            request.session["email"] = user.UserEmailAddress
            request.session["name"] = user.UserName
            request.session["role"] = user.UserRole

            return redirect("dashboard")

            # Session expires after 3 hours
            request.session.set_expiry(10800)

        except UserInformation.DoesNotExist:
            messages.error(request,"User Is Not Found...")
            return render(request, "login.html")

    return render(request,'login.html')


def logout_view(request):

    # when user Logout It Will Automatically Terminate the Session
    request.session.flush()
    # return back to Login Page
    return render(request,'login.html')


def signup_view(request):

    if request.method =="POST":
        UserName=request.POST["UserFullName"].strip()
        UserEmail=request.POST["SignUpEmail"].strip()
        UserPhoneNo=request.POST["Phone"]
        UserPassword=request.POST["SignUpPassword"]

        # To Check Username Is not Taken Again and again
        if UserInformation.objects.filter(UserName__iexact=UserName).exists():
            messages.error(request,"UserName Is Already Taken Please Try With Another UserName.....")
            return render(request,'signup.html')

        # To Check User Email Address Must Be Unique not Repeated again and again
        if UserInformation.objects.filter(UserEmailAddress__iexact=UserEmail).exists():
            messages.error(request,"The Email Address Is Already Register Try With New")
            return render(request,'signup.html')

        # to check User Contact Number is not Repeated...
        if UserInformation.objects.filter(UserContact__iexact=UserPhoneNo).exists():
            messages.error(request,"Your Contact No Is Aready Register Try With New...")
            return render(request,'signup.html')

        # to Store the Data IN Database
        UserInformation.objects.create(
            UserName=UserName,
            UserEmailAddress=UserEmail,
            UserContact=UserPhoneNo,
            UserPassword=UserPassword,

        )

        # if Sucess then Go to Login Page Else Stay Here....
        messages.success(request,"Your Information Is Successfully Registered ")
        return render(request,'login.html')

    return render(request,'signup.html')



# works Pending Here
def profile_view(request):

    if "user_id" not in request.session:
        return redirect("login")

    Userid = request.session.get("user_id")


    UserInfo= UserInformation.objects.get(UserId=Userid)


    return render(request, "profile.html", {
        "UserInfo": UserInfo
    })

