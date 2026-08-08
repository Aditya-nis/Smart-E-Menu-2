from django.urls import path
from . import views

urlpatterns = [

    path("", views.kitchen_dashboard,name="kitchen_dashboard"),

    path("pending/", views.pending_orders),

    path("ready/", views.update_status),



]