from django.shortcuts import render
from django.http import HttpResponse

def bill(request):
    return render(request,'bill.html')

def payment(request):
    pass

def invoice(request):
    pass