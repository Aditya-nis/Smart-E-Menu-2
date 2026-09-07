import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "EMenu.settings")

from EMenu.wsgi import application

app = application
