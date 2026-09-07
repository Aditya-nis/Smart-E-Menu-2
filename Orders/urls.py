from django.urls import path
from . import views

urlpatterns = [
    path("cart/", views.cart, name="cart"),
    path("add/", views.add_to_cart, name="add_to_cart"),
    path("remove/", views.remove_cart, name="remove_cart"),
    path("update-qty/", views.update_cart_qty, name="update_cart_qty"),
    path("place/", views.place_order, name="place_order"),
    path("history/", views.order_history, name="order_history"),
]
