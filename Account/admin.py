from django.contrib import admin

from Account.models import UserInformation

@admin.register(UserInformation)
class UserInformationAdmin(admin.ModelAdmin):
    list_display = ("UserId", "UserName", "UserEmailAddress", "UserContact", "UserRole")
    search_fields = ("UserName", "UserEmailAddress", "UserContact")
    list_filter = ("UserRole",)