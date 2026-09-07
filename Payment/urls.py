from django.urls import path
from . import views

urlpatterns = [
    path("bill/", views.bill, name="bill"),
    path("pay/", views.payment, name="payment"),
    path("invoice/", views.invoice, name="invoice"),
    path("invoice/<int:order_id>/", views.invoice, name="invoice_detail"),
]
