from django.urls import path
from . import views

urlpatterns = [

    path("", views.home, name="home"),

    path("menu/", views.menu, name="menu"),

    path("category/", views.category, name="category"),

    path("food/<int:id>/", views.food_detail, name="food"),

    path("Order-Tracking/",views.order_tracking,name="order-tracking"),

    path("dashboard/", views.dashboard, name="dashboard"),
    path("Test/",views.test)

]