import asyncio
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import ChatRequestSerializer, ChatResponseSerializer
from .services.memory_manager import chat as memory_chat, stream_chat
from django.http import StreamingHttpResponse
from .permissions import APIKeyPermission

class ChatAPIView(APIView):
    permission_classes = [APIKeyPermission]

    def post(self, request):
        # Add debugging for incoming request
        print(f"Received request data: {request.data}")
        print(f"Request content type: {request.content_type}")
        
        serializer = ChatRequestSerializer(data=request.data)
        if not serializer.is_valid():
            print(f"Serializer validation errors: {serializer.errors}")
            return Response({'errors': serializer.errors}, status=400)
            
        user_id = serializer.validated_data['user_id']
        agent_id = serializer.validated_data['agent_id']
        agent_description = serializer.validated_data.get('agent_description', '')
        ai_model_name = serializer.validated_data.get('ai_model_name', '')
        ai_model_provider = serializer.validated_data.get('ai_model_provider', '')
        query = serializer.validated_data['query']
        agent_instructions = serializer.validated_data.get('agent_instructions')
        agent_name = serializer.validated_data.get('agent_name')  # Extract agent_name from Node.js
        agent_role = serializer.validated_data.get('agent_role')  # Extract agent_role from Node.js
        protocol_metadata = serializer.validated_data.get('protocol_metadata')
        files = serializer.validated_data.get('files')
        
        # Log agent information for debugging
        if agent_instructions:
            print(f"Agent instructions received: {agent_instructions[:200]}...")
        else:
            print("No agent instructions provided")
            
        if agent_name:
            print(f"Agent name from Node.js: {agent_name}")
        if agent_role:
            print(f"Agent role from Node.js: {agent_role}")
        
        # Log protocol information if present
        if protocol_metadata:
            print(f"Protocol execution received: {protocol_metadata.get('protocol_name', 'Unknown')} (Level {protocol_metadata.get('protocol_level', 'Unknown')})")
            print(f"Protocol description: {protocol_metadata.get('protocol_description', 'N/A')}")
            print(f"Protocol type: {protocol_metadata.get('protocol_type', 'N/A')}")
            if protocol_metadata.get('protocol_prompt_template'):
                print(f"Protocol template: {protocol_metadata.get('protocol_prompt_template')[:200]}...")
            print(f"Original content: {protocol_metadata.get('original_content', 'N/A')[:100]}...")
            print(f"Modified content (query): '{query}'")
            
            # If query is empty but we have protocol metadata, generate a default query
            if not query.strip():
                protocol_name = protocol_metadata.get('protocol_name', 'Unknown Protocol')
                original_content = protocol_metadata.get('original_content', '')
                query = f"Execute the {protocol_name} protocol. Original request: {original_content}"
                print(f"Generated default query for empty protocol: {query}")
        else:
            print("No protocol metadata received - this is a regular chat query")
        
        # get async generator (pass agent_name, agent_role, and protocol metadata for context)
        async_gen = stream_chat(user_id, agent_id, query, agent_instructions, agent_name, agent_role, protocol_metadata, agent_description, ai_model_name, ai_model_provider, files)
        
        # Track token usage and response metadata
        response_metadata = {
            'total_tokens': 0,
            'prompt_tokens': 0,
            'completion_tokens': 0,
            'agent_name': 'Unknown',
            'model_used': 'gpt-4o-mini'
        }
        
        # create a sync iterator to drive the async generator
        def sync_iterator():
            loop = asyncio.new_event_loop()
            complete_response = ""
            try:
                while True:
                    chunk_data = loop.run_until_complete(async_gen.__anext__())
                    
                    # Check if this is metadata or content
                    if isinstance(chunk_data, dict):
                        # This is metadata (token usage, etc.)
                        response_metadata.update(chunk_data)
                        continue
                    else:
                        # This is content
                        complete_response += str(chunk_data)
                        yield str(chunk_data)
                        
            except StopAsyncIteration:
                # Send final metadata as the last chunk
                import json
                metadata_chunk = f"\n\n---METADATA---\n{json.dumps(response_metadata)}\n---END---"
                yield metadata_chunk
                loop.close()
                return
                
        return StreamingHttpResponse(sync_iterator(), content_type='text/event-stream')


# Health Check Views for ECS
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
