from django.db import models

# Create your models here.
class UserInformation(models.Model):
    # use as the primary key
    UserId=models.AutoField(primary_key=True)

    UserName=models.CharField(max_length=30)
    UserEmailAddress=models.EmailField()
    UserPassword=models.CharField(max_length=20)
    UserContact=models.CharField(max_length=13)

    UserRole=models.CharField(
        max_length=20,
        choices=[
            ("Customer","Customer"),
            ("Chef","Chef"),
            ("Manager","Manager")
        ]
        , default="Customer"
    )


    def __str__(self):
        return self.UserName
