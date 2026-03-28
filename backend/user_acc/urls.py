from django.urls import path, re_path
from django.views.generic import TemplateView
from user_acc import api_views
from . import views

urlpatterns = [
  path('api/get-csrf-token/', views.get_csrf_token, name='get-csrf-token'),
]
