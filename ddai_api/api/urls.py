from django.urls import path
from .views import ChatAPIView, health_check, health_check_detailed

urlpatterns = [
    path('chat/', ChatAPIView.as_view(), name='chat'),
    path('health/', health_check, name='health_check'),
    path('health/detailed/', health_check_detailed, name='health_check_detailed'),
]
