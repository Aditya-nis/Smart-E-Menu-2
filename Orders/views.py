from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib import messages


def cart(request):
    if "user_id" not in request.session:
        messages.error(request,'You Have To Login.......')
        return render(request,'login.html')



    return render(request,'cart.html')

def add_to_cart(request):
    pass

def remove_cart(request):
    pass


@login_required(login_url='login')
def place_order(request):
    pass

def order_history(request):
    pass