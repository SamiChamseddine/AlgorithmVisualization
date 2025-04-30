from django.contrib import admin
from django.urls import path, include, re_path
from api.views import CreateUserView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.http import HttpResponse
from api.routing import websocket_urlpatterns
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Serve the React app for all non-API requests
def serve_react_app(request, path=''):
    dist_path = os.path.join(BASE_DIR, '..', 'frontend', 'dist', 'index.html')

    # Read the content of index.html
    with open(dist_path, 'r') as f:
        return HttpResponse(f.read())

urlpatterns = [
    # API routes first
    path("api/user/register/", CreateUserView.as_view(), name="register"),
    path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("api-auth/", include("rest_framework.urls")),
    path("api/", include("api.urls")),
    
    path("ws/sort/", include(websocket_urlpatterns)),  # Ensure this is above the React app catch-all
    
    # Serve the React app for other routes (including /logout) 
    # Ensure this catch-all route comes after API routes
    re_path(r'^.*$', serve_react_app),  # This will serve the React app for all non-API requests
]
