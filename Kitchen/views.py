from django.contrib.auth.decorators import login_required
from django.shortcuts import render

@login_required(login_url='signup')
def kitchen_dashboard(request):
    return render(request,'kitchen-dashboard.html')

def pending_orders(request):
    pass

def update_status(request, order_id):
    pass