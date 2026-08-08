from django.shortcuts import render
from django.http import HttpResponse
from menu.models import FoodCategory, FoodMenu


def home(request):
    category=FoodCategory.objects.all()
    FoodItemInfo=FoodMenu.objects.all()
    context={
        "FoodItemInfo":FoodItemInfo,
        "category":category
    }



    return render(request, "index.html",{"context":context})

def menu(request):

    # to Fetch the all required data from database
    FoodItemInfo=FoodMenu.objects.all()


    return render(request,'menu.html',{"FoodItemInfo":FoodItemInfo})

def category(request):
   pass



def food_detail(request, id):
    pass

def order_tracking(request):
    return render(request,'order-tracking.html')

def dashboard(request):
    return render(request,'dashboard.html')

def test(request):
    return render(request,'sample.html')