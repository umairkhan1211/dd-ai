from django.urls import path
from api.views.health import (
    health_check,
    health_check_detailed,
)

urlpatterns = [
    # Basic health check for ECS load balancer
    path('', health_check, name='health_check'),
    
    # Detailed health check with database connectivity
    path('detailed/', health_check_detailed, name='health_check_detailed'),
]
