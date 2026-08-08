from django.urls import path
from . import views

urlpatterns = [

    path("cart/", views.cart,name='cart'),

    path("add/", views.add_to_cart),

    path("place/", views.place_order),

    path("history/", views.order_history),

]