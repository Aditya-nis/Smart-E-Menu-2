from django.urls import path
from . import views

urlpatterns = [

    path("bill/", views.bill, name="bill"),

    path("pay/", views.payment),

]