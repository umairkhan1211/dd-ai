from rest_framework.permissions import BasePermission
from django.conf import settings

class APIKeyPermission(BasePermission):
    """Permission that checks for a valid API key in the X-API-KEY header."""
    def has_permission(self, request, view):
        api_key = request.headers.get('X-API-KEY')
        return api_key is not None and api_key == settings.API_KEY
