from rest_framework import serializers


class ChatRequestSerializer(serializers.Serializer):
    user_id = serializers.CharField()
    agent_id = serializers.CharField()
    query = serializers.CharField(allow_blank=True)  # Allow blank when using protocols
    agent_instructions = serializers.CharField(required=False, allow_blank=True)
    agent_description = serializers.CharField(required=False, allow_blank=True)
    agent_name = serializers.CharField(required=False, allow_blank=True)
    agent_role = serializers.CharField(required=False, allow_blank=True)
    ai_model_name = serializers.CharField(required=False, allow_blank=True)
    ai_model_provider = serializers.CharField(required=False, allow_blank=True)
    protocol_metadata = serializers.JSONField(required=False, allow_null=True)
    files = serializers.JSONField(required=False, allow_null=True)

    def validate(self, data):
        # If no protocol metadata and query is blank, that's an error
        if not data.get('protocol_metadata') and not data.get('query', '').strip():
            raise serializers.ValidationError("Query cannot be blank unless executing a protocol")
        return data


class ChatResponseSerializer(serializers.Serializer):
    response = serializers.CharField()
