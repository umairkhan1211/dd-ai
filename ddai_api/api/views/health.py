from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
import os
import sys
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
@require_http_methods(["GET"])
def health_check(request):
    """
    Basic health check endpoint for ECS load balancer
    Returns 200 OK with basic system information
    """
    try:
        health_data = {
            "status": "OK",
            "timestamp": datetime.now().isoformat(),
            "service": "dd-ai-python-api",
            "version": "1.0.0",
            "environment": os.environ.get('DJANGO_ENV', 'development'),
            "python_version": sys.version.split()[0],
        }
        
        return JsonResponse(health_data, status=200)
    
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JsonResponse({
            "status": "ERROR",
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
        }, status=503)

@csrf_exempt
@require_http_methods(["GET"])
def health_check_detailed(request):
    """
    Detailed health check with database connectivity
    """
    try:
        health_data = {
            "status": "OK",
            "timestamp": datetime.now().isoformat(),
            "service": "dd-ai-python-api",
            "version": "1.0.0",
            "environment": os.environ.get('DJANGO_ENV', 'development'),
            "python_version": sys.version.split()[0],
        }
        
        # Database connectivity check
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                health_data["database"] = {
                    "status": "connected",
                    "backend": connection.vendor,
                }
        except Exception as db_error:
            health_data["database"] = {
                "status": "disconnected",
                "error": str(db_error)
            }
            health_data["status"] = "DEGRADED"
        
        # Environment variables (non-sensitive)
        health_data["config"] = {
            "debug": os.environ.get('DEBUG', 'False'),
            "db_configured": "yes" if os.environ.get('DB_HOST') else "no",
            "openai_configured": "yes" if os.environ.get('OPENAI_API_KEY') else "no"
        }
        
        # Determine final status
        status_code = 200
        if health_data.get("database", {}).get("status") == "disconnected":
            status_code = 503
            health_data["status"] = "ERROR"
        
        return JsonResponse(health_data, status=status_code)
    
    except Exception as e:
        logger.error(f"Detailed health check failed: {e}")
        return JsonResponse({
            "status": "ERROR",
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
        }, status=503)
