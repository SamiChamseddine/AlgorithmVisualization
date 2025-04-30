from django.urls import path
from .consumers import FittingConsumer

websocket_urlpatterns = [
    path('ws/fit/', FittingConsumer.as_asgi()),
]
