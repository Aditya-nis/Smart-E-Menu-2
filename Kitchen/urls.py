from django.urls import path
from . import views

urlpatterns = [
    path("", views.kitchen_dashboard, name="kitchen_dashboard"),
    path("pending/", views.pending_orders, name="pending_orders"),
    path("update-status/<int:order_id>/", views.update_status, name="update_status"),
    path("update-status/", views.update_status, name="update_status_post"),
]
