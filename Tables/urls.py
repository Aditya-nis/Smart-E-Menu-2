from django.urls import path
from . import views

urlpatterns = [

    path("tables/", views.tables, name="tables"),
    path("Book-Table/<int:id>/",views.BookSeat,name="BookSeat"),

]