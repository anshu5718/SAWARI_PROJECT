from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.views.static import serve
from sawari.ninja_api import api

import vehicles.api_views
import reservation.api_views
import user_acc.api_views
import admin_panel.api_views
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api.urls),              
    path('', include('user_acc.urls')),  
]

urlpatterns += [
    # ❌ DO NOT let React catch static files
    re_path(r'^static/(?P<path>.*)$', serve, {
        'document_root': settings.STATIC_ROOT
    }),

    re_path(r'^media/(?P<path>.*)$', serve, {
        'document_root': settings.MEDIA_ROOT
    }),

    # ✅ React MUST be last
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]
