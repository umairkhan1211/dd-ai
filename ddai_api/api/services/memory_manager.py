"""
Enhanced memory manager using PostgreSQL and Agno best practices
Implements proper agent naming and efficient PostgreSQL-based storage
"""
import asyncio
import os
import json
import threading
from typing import Optional, Dict, List
from datetime import datetime
import re
import logging
from dataclasses import dataclass
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.memory.v2.db.postgres import PostgresMemoryDb
from agno.memory.v2.memory import Memory
from agno.memory.v2.schema import UserMemory
from agno.storage.postgres import PostgresStorage
from agno.media import File, Image

# s3 config
import boto3
from botocore.exceptions import NoCredentialsError, ClientError

# Add S3 configuration.
# Support both backend-style names and legacy frontend-prefixed names.
S3_BUCKET_NAME = os.getenv('S3_BUCKET_NAME') or os.getenv('VITE_S3_BUCKET_NAME')
S3_REGION = os.getenv('S3_REGION') or os.getenv('VITE_S3_REGION')
S3_ACCESS_KEY = os.getenv('S3_ACCESS_KEY') or os.getenv('VITE_S3_ACCESS_KEY')
S3_SECRET_KEY = os.getenv('S3_SECRET_KEY') or os.getenv('VITE_S3_SECRET_KEY')

# Configure logging to work independently of Django
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Configure Agno monitoring if API key is provided
AGNO_API_KEY = os.getenv('AGNO_API_KEY')
AGNO_MONITOR = os.getenv('AGNO_MONITOR', 'false').lower() == 'true'

OPENAI_KEY = os.getenv('OPENAI_API_KEY')
ANTHROPIC_KEY = os.getenv('ANTHROPIC_API_KEY')
GOOGLE_KEY = os.getenv('GEMINI_API_KEY')
PERPLEXITY_KEY = os.getenv('PERPLEXITY_API_KEY')

DEFAULT_MODEL_BY_PROVIDER = {
    "openai": os.getenv('OPENAI_MODEL', 'gpt-4o-mini'),
    "anthropic": os.getenv('ANTHROPIC_MODEL', 'claude-opus-4-7'),
    "google": os.getenv('GEMINI_MODEL', 'gemini-2.5-flash'),
    "perplexity": os.getenv('PERPLEXITY_MODEL', 'sonar'),
}

if AGNO_API_KEY:
    logger.info("Agno API key found - monitoring enabled for dashboard at app.agno.com")
    # Set environment variable for Agno monitoring
    os.environ['AGNO_API_KEY'] = AGNO_API_KEY
    os.environ['AGNO_MONITOR'] = 'true'
else:
    logger.warning("AGNO_API_KEY not found - dashboard monitoring will be disabled")

@dataclass
class PostgresConfig:
    """PostgreSQL configuration from environment variables or defaults"""
    host: str = os.getenv('DB_HOST', 'dd-ai-prod-main.cveuqyu00fac.eu-central-1.rds.amazonaws.com')
    port: int = int(os.getenv('DB_PORT', '5432'))
    database: str = os.getenv('DB_NAME', 'postgres')
    username: str = os.getenv('DB_USER', 'postgres')
    password: str = os.getenv('DB_PASSWORD', 'mBd5iTqVRfvvV2nvYbWK')
    
    def __post_init__(self):
        """Validate configuration after initialization"""
        if not self.password:
            logger.warning("DB_PASSWORD is empty - this may cause connection issues")
        logger.debug(f"Using database connection: postgresql://{self.username}:***@{self.host}:{self.port}/{self.database}")
    
    @property
    def connection_string(self) -> str:
        """Generate PostgreSQL connection string"""
        return f"postgresql://{self.username}:{self.password}@{self.host}:{self.port}/{self.database}"

class EnhancedPostgresMemory:
    """Enhanced PostgreSQL-based memory with efficient storage and retrieval"""
    
    def __init__(self, storage_id: str, table_prefix: str = "agent"):
        self.storage_id = storage_id
        self.config = PostgresConfig()
        self.table_name = f"{table_prefix}_{storage_id}_memory"
        
        # Initialize PostgreSQL memory database
        self.memory_db = PostgresMemoryDb(
            db_url=self.config.connection_string,
            table_name=self.table_name,
            schema="public"
        )
        
        # Initialize Agno Memory with PostgreSQL backend
        self.memory = Memory(
            model=OpenAIChat(id="gpt-4o-mini"),
            db=self.memory_db
        )
        
        self.lock = threading.Lock()
        logger.info(f"Enhanced PostgreSQL memory initialized for {storage_id}")
    
    def add_user_memory(self, user_id: str, content: str, metadata: Optional[Dict] = None):
        """Add a user memory using correct Agno v2 API"""
        try:
            with self.lock:
                # Extract topics from metadata or generate basic ones
                topics = []
                if metadata:
                    topics = metadata.get('topics', [])
                    if metadata.get('type'):
                        topics.append(metadata['type'])
                
                # Create proper UserMemory object using Agno schema
                user_memory = UserMemory(
                    memory=content,
                    topics=topics
                )
                
                # Use correct Agno v2 API method
                memory_id = self.memory.add_user_memory(
                    memory=user_memory,
                    user_id=user_id
                )
                
            logger.debug(f"Added user memory for user {user_id}: {content[:100]}... (ID: {memory_id})")
            return memory_id
        except Exception as e:
            logger.error(f"Failed to add user memory for {user_id}: {e}")
            return None

    async def store_memory(self, user_id: str, content: str, metadata: Optional[Dict] = None):
        """Store a memory with optional metadata - using the working API"""
        return self.add_user_memory(user_id, content, metadata)

    async def retrieve_memories(self, user_id: str, query: str, limit: int = 5) -> List[Dict]:
        """Retrieve relevant memories for a user based on query"""
        try:
            # Use correct Agno v2 search method with agentic search
            memories = self.memory.search_user_memories(
                user_id=user_id,
                query=query,
                limit=limit,
                retrieval_method="agentic"  # Use agentic search for better results
            )
            
            # Convert memories to dict format
            memory_dicts = []
            for memory in memories:
                memory_dict = {
                    'id': getattr(memory, 'id', None),
                    'content': memory.memory,
                    'topics': getattr(memory, 'topics', []),
                    'created_at': getattr(memory, 'created_at', None),
                    'updated_at': getattr(memory, 'updated_at', None)
                }
                memory_dicts.append(memory_dict)
            
            logger.debug(f"Found {len(memory_dicts)} memories for user {user_id} with query '{query}'")
            return memory_dicts
        except Exception as e:
            logger.error(f"Failed to retrieve memories for {user_id}: {e}")
            return []

    async def get_user_memories(self, user_id: str, limit: int = 50) -> List[Dict]:
        """Get all memories for a user"""
        try:
            # Use correct Agno v2 method to get all user memories
            memories = self.memory.get_user_memories(user_id=user_id)
            
            # Convert memories to dict format
            memory_dicts = []
            for memory in memories[:limit]:  # Apply limit after retrieval
                memory_dict = {
                    'id': getattr(memory, 'id', None),
                    'content': memory.memory,
                    'topics': getattr(memory, 'topics', []),
                    'created_at': getattr(memory, 'created_at', None),
                    'updated_at': getattr(memory, 'updated_at', None)
                }
                memory_dicts.append(memory_dict)
            
            logger.debug(f"Retrieved {len(memory_dicts)} memories for user {user_id}")
            return memory_dicts
        except Exception as e:
            logger.error(f"Failed to get user memories for {user_id}: {e}")
            return []
    
    async def clear_user_memories(self, user_id: str):
        """Clear all memories for a user"""
        try:
            # Use the correct Agno Memory v2 API method (not async)
            self.memory.clear_memories(user_id=user_id)
            logger.info(f"Cleared memories for user {user_id}")
        except Exception as e:
            logger.error(f"Failed to clear memories for {user_id}: {e}")
    
    async def get_memory_stats(self, user_id: str) -> Dict:
        """Get memory statistics for a user"""
        try:
            return {
                'total_memories': 0,  # Delegated to Agno's built-in memory
                'storage_type': 'postgresql',
                'table_name': self.table_name,
                'note': 'Memory management delegated to Agno Agent built-in system'
            }
        except Exception as e:
            logger.error(f"Failed to get memory stats for {user_id}: {e}")
            return {'error': str(e)}

def _enforce_agent_identity(response_content: str, agent_name: str, agent_role: str = "AI Assistant") -> str:
    """Post-process response to ensure agent identity and role are maintained and no unwanted references exist"""
    
    # Patterns to replace with agent identity
    replacements = [
        # Direct ChatGPT references
        (r'\bChatGPT\b', agent_name),
        (r'\bGPT-4\b', agent_name),
        (r'\bGPT-3\.5\b', agent_name),
        (r'\bGPT 4\b', agent_name),
        (r'\bGPT 3\.5\b', agent_name),
        
        # AI model references with role context
        (r'\bI am an AI language model\b', f'I am {agent_name}, a {agent_role}'),
        (r'\bI\'m an AI language model\b', f'I\'m {agent_name}, a {agent_role}'),
        (r'\bI am an AI assistant\b', f'I am {agent_name}, a {agent_role}'),
        (r'\bI\'m an AI assistant\b', f'I\'m {agent_name}, a {agent_role}'),
        (r'\bI am an artificial intelligence\b', f'I am {agent_name}, a {agent_role}'),
        (r'\bI\'m an artificial intelligence\b', f'I\'m {agent_name}, a {agent_role}'),
        
        # OpenAI references
        (r'\bcreated by OpenAI\b', f'created to assist you as {agent_name}'),
        (r'\bdeveloped by OpenAI\b', f'developed to serve as {agent_name}, a {agent_role}'),
        (r'\bby OpenAI\b', f'as {agent_name}'),
        
        # Generic AI references that might leak through
        (r'\bI don\'t have a personal name\b', f'My name is {agent_name}'),
        (r'\bI don\'t have a name\b', f'My name is {agent_name}'),
        (r'\byou can call me ChatGPT\b', f'you can call me {agent_name}'),
        (r'\byou can call me GPT\b', f'you can call me {agent_name}'),
        
        # Introduction patterns with role
        (r'\bHello! I am an AI language model[^.]*\. I don\'t have a personal name[^.]*\.\b', 
         f'Hello! I am {agent_name}, a {agent_role}, and I\'m here to assist you.'),
    ]
    
    # Apply all replacements (case-insensitive)
    for pattern, replacement in replacements:
        response_content = re.sub(pattern, replacement, response_content, flags=re.IGNORECASE)
    
    # If the response still starts with generic AI introduction, replace it
    generic_intro_patterns = [
        r'^Hello! I am an AI[^.]*\.',
        r'^Hi! I am an AI[^.]*\.',
        r'^I am an AI[^.]*\.',
        r'^As an AI[^,]*,'
    ]
    
    for pattern in generic_intro_patterns:
        if re.match(pattern, response_content, re.IGNORECASE):
            response_content = f"Hello! I am {agent_name}, a {agent_role}, and I'm here to assist you. " + re.sub(pattern, '', response_content, flags=re.IGNORECASE).strip()
            break
    
    return response_content

class ProductionMemoryManager:
    """Production-grade memory manager with PostgreSQL storage and proper agent naming"""
    
    def __init__(self):
        self.config = PostgresConfig()
        self.user_memories: Dict[str, EnhancedPostgresMemory] = {}
        self.agent_memories: Dict[str, EnhancedPostgresMemory] = {}
        self.agents: Dict[str, Agent] = {}
        
        # Initialize PostgreSQL storage for agent sessions
        self.storage = PostgresStorage(
            db_url=self.config.connection_string,
            table_name="agent_sessions",
            schema="public",
            auto_upgrade_schema=True
        )
        
        logger.info("Production Memory Manager initialized with PostgreSQL backend")
    
    def _get_user_memory(self, user_id: str) -> EnhancedPostgresMemory:
        """Get or create user-specific memory with PostgreSQL storage"""
        if user_id not in self.user_memories:
            self.user_memories[user_id] = EnhancedPostgresMemory(
                storage_id=f"user_{user_id}",
                table_prefix="user"
            )
        return self.user_memories[user_id]
    
    def _get_agent_memory(self, agent_id: str) -> EnhancedPostgresMemory:
        """Get or create agent-specific memory with PostgreSQL storage"""
        if agent_id not in self.agent_memories:
            self.agent_memories[agent_id] = EnhancedPostgresMemory(
                storage_id=f"agent_{agent_id}",
                table_prefix="agent"
            )
        return self.agent_memories[agent_id]
    
    def _extract_agent_name(self, agent_instructions: Optional[str]) -> str:
        """Extract agent name from instructions using various patterns"""
        if not agent_instructions:
            return "Assistant"
        
        name_patterns = [
            r"You are ([^.,\n]+)",
            r"name[:\s]+([^.,\n]+)",
            r"I am ([^.,\n]+)",
            r"My name is ([^.,\n]+)",
            r"Call me ([^.,\n]+)",
            r"I'm ([^.,\n]+)"
        ]
        
        for pattern in name_patterns:
            match = re.search(pattern, agent_instructions, re.IGNORECASE)
            if match:
                name = match.group(1).strip()
                # Clean up the name (remove common words that shouldn't be part of the name)
                if not any(word in name.lower() for word in ['a ', 'an ', 'the ', 'your ', 'helpful']):
                    return name
        
        return "Assistant"
    
    def _get_model_and_key(self, ai_model_provider: str, ai_model_name: str) -> tuple:
        provider = (ai_model_provider or "openai").lower()
        model_name = self._normalize_model_name(provider, ai_model_name)

        if provider == "openai":
            if not OPENAI_KEY:
                raise ValueError("OpenAI API key not found in environment variables")
            from agno.models.openai import OpenAIChat
            return OpenAIChat(id=model_name, api_key=OPENAI_KEY), OPENAI_KEY
            
        elif provider == "anthropic":
            if not ANTHROPIC_KEY:
                raise ValueError("Anthropic API key not found in environment variables")
            from agno.models.anthropic import Claude
            return Claude(id=model_name, api_key=ANTHROPIC_KEY), ANTHROPIC_KEY
            
        elif provider == "google":
            if not GOOGLE_KEY:
                raise ValueError("Google API key not found in environment variables")
            from agno.models.google import Gemini
            return Gemini(id=model_name, api_key=GOOGLE_KEY, temperature=0.7), GOOGLE_KEY
            
        elif provider == "perplexity":
            if not PERPLEXITY_KEY:
                raise ValueError("Perplexity API key not found in environment variables")
            from agno.models.perplexity import Perplexity  # Perplexity uses OpenAI-compatible API
            return Perplexity(
                id=model_name, 
                api_key=PERPLEXITY_KEY,
                base_url="https://api.perplexity.ai",
                temperature=0.7
            ), PERPLEXITY_KEY
            
        else:
            logger.warning(f"Unknown AI provider: {provider}, falling back to OpenAI")
            if not OPENAI_KEY:
                raise ValueError("OpenAI API key not found in environment variables (fallback)")
            from agno.models.openai import OpenAIChat
            return OpenAIChat(id="gpt-4o-mini", api_key=OPENAI_KEY, temperature=0.7), OPENAI_KEY

    def _normalize_model_name(self, provider: str, model_name: Optional[str]) -> str:
        """Normalize provider model names and keep a stable fallback."""
        resolved = (model_name or DEFAULT_MODEL_BY_PROVIDER.get(provider) or "gpt-4o-mini").strip()

        if provider == "anthropic":
            # Anthropic model IDs can appear with date suffixes in local DB values.
            # Example: claude-opus-4-7-20260414 -> claude-opus-4-7
            canonical = re.sub(
                r"^(claude-(?:opus|sonnet)-\d+(?:-\d+)?)-\d{8}$",
                r"\1",
                resolved,
            )
            if canonical != resolved:
                logger.warning(
                    f"Normalized Anthropic model ID from '{resolved}' to '{canonical}'"
                )
            resolved = canonical

        return resolved

    def _get_agent(self, user_id: str, agent_id: str, agent_instructions: Optional[str] = None, agent_name: Optional[str] = None, agent_role: Optional[str] = None, protocol_metadata: Optional[Dict] = None, agent_description: Optional[str] = None, ai_model_name: Optional[str] = None, ai_model_provider: Optional[str] = None ) -> Agent:
        """Get or create agent with proper naming and SHARED user memory across all agents for the same user"""
        agent_key = f"{user_id}_{agent_id}"
        
        # Use explicit agent_name from Node.js if provided, otherwise extract from instructions
        final_agent_name = agent_name or self._extract_agent_name(agent_instructions)
        
        # Use agent_role if provided, otherwise default to assistant
        final_agent_role = agent_role or "AI Assistant"
        
        # Get SHARED user memory - all agents for this user will use the same memory
        shared_user_memory = self._get_user_memory(user_id)
        
        # Get agent-specific memory for agent's own knowledge (optional)
        agent_memory = self._get_agent_memory(agent_id)
        try:
            model_instance, api_key = self._get_model_and_key(ai_model_provider, ai_model_name)
            logger.info(f"Using {ai_model_provider or 'openai'} provider with model {model_instance.id}")
        except ValueError as e:
            logger.error(f"Model configuration error: {e}")
            # Fallback to OpenAI if available
            if OPENAI_KEY:
                from agno.models.openai import OpenAIChat
                model_instance = OpenAIChat(id="gpt-4o-mini", api_key=OPENAI_KEY, temperature=0.7)
                logger.warning("Falling back to OpenAI GPT-4o-mini")
            else:
                raise ValueError("No valid API keys found for any supported AI provider")
            # Prepare enhanced instructions with protocol context
        enhanced_instructions = self._prepare_instructions(
            agent_instructions, final_agent_name, final_agent_role, user_id, agent_id, protocol_metadata
        )
        if agent_key not in self.agents:
            # Create agent with latest Agno patterns and conditional monitoring
            monitoring_enabled = bool(AGNO_API_KEY and AGNO_MONITOR)
            
            self.agents[agent_key] = Agent(
                # Agent identification (latest Agno patterns)
                name=final_agent_name,  # Proper agent naming as per latest Agno docs
                description=agent_description,
                role=final_agent_role,
                # Model configuration
                model=model_instance,
                
                # Instructions and behavior
                instructions=enhanced_instructions,
                
                # SHARED USER MEMORY - All agents for this user use the same memory
                memory=shared_user_memory.memory,  # This is the key change - shared memory
                
                # Storage configuration
                storage=self.storage,
                add_history_to_messages=True,
                num_history_runs=5,
                read_chat_history=True,
                
                # Response configuration
                markdown=True,
                show_tool_calls=False,
                add_datetime_to_instructions=True,
                
                # Monitoring configuration (as per latest Agno docs)
                monitoring=monitoring_enabled,  # Enable monitoring for app.agno.com dashboard if API key is present
                debug_mode=False  # Set to True for debugging if needed
            )
            
            # Store reference to agent memory for knowledge base (but primary memory is shared)
            self.agents[agent_key]._agent_memory = agent_memory
            self.agents[agent_key]._shared_user_memory = shared_user_memory  # Reference to shared memory
            self.agents[agent_key]._agent_role = final_agent_role
            self.agents[agent_key].name = final_agent_name
            self.agents[agent_key].role = final_agent_role
            
            logger.info(f"Created new agent: {final_agent_name} ({final_agent_role}) - ID: {agent_id} for user: {user_id} {'with monitoring enabled' if monitoring_enabled else 'without monitoring'} - USING SHARED USER MEMORY: {shared_user_memory.table_name}")
        else:
            # Update existing agent with fresh instructions
            enhanced_instructions = self._prepare_instructions(
                agent_instructions, final_agent_name, final_agent_role, user_id, agent_id, protocol_metadata
            )
            self.agents[agent_key].model = model_instance
            self.agents[agent_key].name = final_agent_name
            self.agents[agent_key].role = final_agent_role
            self.agents[agent_key].instructions = enhanced_instructions
            self.agents[agent_key].description = agent_description
            
        return self.agents[agent_key]
    
    def _prepare_instructions(self, agent_instructions: Optional[str], agent_name: str, agent_role: str, user_id: str, agent_id: str, protocol_metadata: Optional[Dict] = None) -> str:
        """Prepare comprehensive agent instructions with protocol context and role-based behavior"""
        base_instructions = agent_instructions or f"You are {agent_name}, a {agent_role}."
        
        # Add protocol-specific instructions if available
        protocol_context = ""
        if protocol_metadata:
            protocol_name = protocol_metadata.get('protocol_name', 'Unknown')
            protocol_description = protocol_metadata.get('protocol_description', '')
            protocol_template = protocol_metadata.get('protocol_prompt_template', '')
            
            protocol_context = f"""
            
            ACTIVE PROTOCOL: {protocol_name}
            Protocol Purpose: {protocol_description}
            {f"Protocol Instructions: {protocol_template}" if protocol_template else ""}
            
            IMPORTANT: You are currently executing the {protocol_name} protocol. Your response should align with the protocol's purpose and instructions above.
            """
        
        enhanced_instructions = f"""
        AGENT IDENTITY - MANDATORY ENFORCEMENT:
        {base_instructions}
        
        ROLE AND PERSONA:
        - Name: {agent_name}
        - Role: {agent_role}
        - Maintain this identity and role consistently throughout the conversation
        - Your responses should reflect the expertise and perspective of a {agent_role}
        
        🚨 CRITICAL IDENTITY RULES - NEVER VIOLATE:
        1. You are {agent_name}, a {agent_role} - this is your ONLY identity
        2. NEVER say "I am ChatGPT" or "I am an AI language model created by OpenAI"
        3. NEVER mention OpenAI, ChatGPT, GPT-4, or any OpenAI products
        4. If asked about your identity, ALWAYS respond as {agent_name}, a {agent_role}
        5. Your responses must reflect the personality, expertise, and characteristics of your role as a {agent_role}
        
        IDENTITY ENFORCEMENT RESPONSES:
        - If asked "What's your name?" or "Who are you?" → "I am {agent_name}, a {agent_role}"
        - If asked about your role → "I am a {agent_role} and I specialize in [relevant capabilities based on role]"
        - If asked about your creator → Refer to your agent description/background, not OpenAI
        - If asked about your capabilities → Explain based on your role as a {agent_role}, not as a language model
        
        {protocol_context}
        
        SHARED USER MEMORY SYSTEM:
        - You have access to ALL previous conversations this user has had with ANY agent
        - The user's information, preferences, and context are shared across all agents for this user
        - If the user has told their name, preferences, or personal details to any other agent, you know them
        - Always reference relevant information from ANY previous conversation with this user
        - Build upon the complete conversation history, not just conversations with you specifically
        - Remember: This user may have interacted with other specialized agents - you have access to that context
        - CRITICAL: When you receive context with 🧠 SHARED USER INFORMATION, you MUST acknowledge and use it
        
        MEMORY AND CONTEXT GUIDELINES:
        - You maintain persistent memory across all agent interactions for this user
        - Always check for relevant user information from previous conversations with any agent
        - Provide personalized responses based on the complete user history
        - If the user seems to be repeating information, gently remind them you remember from previous conversations
        - Be contextually aware - if they mentioned their job, name, preferences, etc. before, reference it naturally
        - If you see shared user information in the context, incorporate it naturally into your response
        - NEVER ignore shared user information - always acknowledge what you know about the user
        
        USER: {user_id}
        AGENT: {agent_id}
        AGENT NAME: {agent_name}
        AGENT ROLE: {agent_role}
        TIMESTAMP: {datetime.now().isoformat()}
        
        ⚠️  FINAL REMINDER: You are {agent_name}, a {agent_role} with access to the complete conversation history of this user across all agents.
        """
        
        return enhanced_instructions.strip()
    
    async def _enrich_context(self, agent: Agent, user_id: str, query: str, protocol_metadata: Optional[Dict] = None) -> str:
        """Enrich query with relevant memories and protocol context"""
        try:
            context_parts = []
            
            # Add protocol context if available
            if protocol_metadata:
                protocol_name = protocol_metadata.get('protocol_name', 'Unknown')
                protocol_level = protocol_metadata.get('protocol_level', 'Unknown')
                protocol_description = protocol_metadata.get('protocol_description', '')
                protocol_template = protocol_metadata.get('protocol_prompt_template', '')
                original_content = protocol_metadata.get('original_content', '')
                
                context_parts.append(f"PROTOCOL EXECUTION: {protocol_name} (Level {protocol_level})")
                if protocol_description:
                    context_parts.append(f"Protocol Description: {protocol_description}")
                if protocol_template:
                    context_parts.append(f"Protocol Template: {protocol_template}")
                if original_content:
                    context_parts.append(f"Original user request: {original_content}")
                context_parts.append("NOTE: The query below has been processed by this protocol. Provide an appropriate response based on the protocol's purpose.")
            
            # Retrieve shared user memories to provide context across all agents
            try:
                user_memory = self._get_user_memory(user_id)
                
                # Try multiple approaches to get memories
                relevant_memories = []
                
                # First try: search with current query
                search_memories = await user_memory.retrieve_memories(user_id, query, limit=10)
                relevant_memories.extend(search_memories)
                
                # Second try: get all recent memories for this user
                if len(relevant_memories) < 3:
                    all_memories = await user_memory.get_user_memories(user_id, limit=20)
                    relevant_memories.extend(all_memories)
                
                # Remove duplicates
                seen_contents = set()
                unique_memories = []
                for memory in relevant_memories:
                    content = memory.get('content', '')
                    if content and content not in seen_contents:
                        unique_memories.append(memory)
                        seen_contents.add(content)
                
                logger.info(f"DEBUG: Found {len(unique_memories)} unique memories for user {user_id}")
                
                if unique_memories:
                    memory_context = []
                    for memory in unique_memories[:10]:  # Limit to top 10
                        memory_content = memory.get('content', '')
                        if memory_content and len(memory_content.strip()) > 0:
                            memory_context.append(f"- {memory_content}")
                            logger.info(f"DEBUG: Adding memory to context: {memory_content[:50]}...")
                    
                    if memory_context:
                        context_parts.append("🧠 SHARED USER INFORMATION (from ALL previous conversations with ANY agent):")
                        context_parts.extend(memory_context)
                        context_parts.append("⚠️ CRITICAL: Use this information to provide a personalized response that acknowledges what you know about the user.")
                        logger.info(f"Added {len(memory_context)} shared memories to context for user {user_id}")
                else:
                    logger.warning(f"No memories found for user {user_id} - this may be their first interaction")
                    
            except Exception as memory_error:
                logger.error(f"Failed to retrieve shared memories for context: {memory_error}")
            
            if context_parts:
                enriched_query = f"""
                CONTEXT:
                {chr(10).join(context_parts)}
                
                CURRENT QUERY: {query}
                
                NOTE: Use the above context to provide a personalized and knowledgeable response.
                """
                return enriched_query
            
        except Exception as e:
            logger.warning(f"Failed to enrich context: {e}")
        
        return query
    
    async def _store_agent_knowledge(self, agent_id: str, user_id: str, query: str, response: str):
        """Store valuable interactions in agent knowledge base and shared user memory"""
        try:
            # Store important user information in shared memory that all agents can access
            user_memory = self._get_user_memory(user_id)
            
            # Extract potential user information from the conversation
            important_info = self._extract_user_information(query, response)
            
            if important_info:
                for info in important_info:
                    await user_memory.store_memory(user_id, info, {"type": "user_info", "agent_id": agent_id})
                    logger.debug(f"Stored user info in shared memory: {info[:50]}...")
            
            logger.debug(f"Agent knowledge storage completed for agent {agent_id}")
        except Exception as e:
            logger.warning(f"Failed to store agent knowledge: {e}")
    
    def _extract_user_information(self, query: str, response: str) -> List[str]:
        """Extract important user information that should be stored in shared memory"""
        important_info = []
        
        # Patterns to extract user information from query
        name_patterns = [
            r"my name is ([^.,\n!?]+)",
            r"i'm ([^.,\n!?]+)",
            r"i am ([^.,\n!?]+)",
            r"call me ([^.,\n!?]+)",
            r"name.*?is ([^.,\n!?]+)"
        ]
        
        work_patterns = [
            r"i work (?:as|at) ([^.,\n!?]+)",
            r"i'm (?:a|an) ([^.,\n!?]+(?:engineer|scientist|developer|analyst|manager|director|consultant|teacher|doctor|nurse|lawyer))",
            r"my job is ([^.,\n!?]+)",
            r"i do ([^.,\n!?]+)",
            r"work (?:as|at) ([^.,\n!?]+)",
            r"employed (?:as|at) ([^.,\n!?]+)"
        ]
        
        company_patterns = [
            r"(?:work|working) at ([^.,\n!?]+)",
            r"(?:work|working) for ([^.,\n!?]+)",
            r"company is ([^.,\n!?]+)",
            r"at (Netflix|Google|Microsoft|Apple|Amazon|Meta|Facebook|Tesla|OpenAI|[A-Z][a-z]+ [A-Z][a-z]+)",
        ]
        
        preference_patterns = [
            r"i (?:love|like|enjoy) ([^.,\n!?]+)",
            r"i'm interested in ([^.,\n!?]+)",
            r"my favorite ([^.,\n!?]+)",
            r"passionate about ([^.,\n!?]+)"
        ]
        
        # Extract from user query (more comprehensive)
        text = query.lower()
        
        # Extract names
        for pattern in name_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                clean_match = match.strip()
                if len(clean_match) > 2 and not any(word in clean_match.lower() for word in ['a ', 'an ', 'the ', 'your ', 'my ']):
                    important_info.append(f"User's name is {clean_match}")
        
        # Extract work/job information
        for pattern in work_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                clean_match = match.strip()
                if len(clean_match) > 3:
                    important_info.append(f"User works as {clean_match}")
        
        # Extract company information
        for pattern in company_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                clean_match = match.strip()
                if len(clean_match) > 2:
                    important_info.append(f"User works at {clean_match}")
        
        # Extract preferences
        for pattern in preference_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                clean_match = match.strip()
                if len(clean_match) > 3:
                    important_info.append(f"User likes {clean_match}")
        
        # Log what we extracted for debugging
        if important_info:
            logger.info(f"DEBUG: Extracted user info from '{query[:50]}...': {important_info}")
        else:
            logger.info(f"DEBUG: No user info extracted from: '{query[:50]}...'")
        
        return important_info

# Global memory manager instance
memory_manager = ProductionMemoryManager()

async def chat(user_id: str, agent_id: str, query: str, agent_instructions: Optional[str] = None, agent_name: Optional[str] = None, agent_role: Optional[str] = None, protocol_metadata: Optional[Dict] = None):
    """Enhanced chat with PostgreSQL memory system and proper agent naming using latest Agno patterns"""
    try:
        # Get agent with PostgreSQL-backed memory and proper naming/role
        agent = memory_manager._get_agent(user_id, agent_id, agent_instructions, agent_name, agent_role, protocol_metadata)
        
        # Enrich query with context and protocol information
        enriched_query = await memory_manager._enrich_context(agent, user_id, query, protocol_metadata)
        
        # Extract final agent name and role for identity enforcement
        final_agent_name = agent_name or memory_manager._extract_agent_name(agent_instructions)
        final_agent_role = agent_role or "AI Assistant"
        
        # Run agent (Agno handles memory automatically)
        response = agent.run(enriched_query, user_id=user_id)
        
        # Extract content from response
        response_content = getattr(response, 'content', str(response))
        
        # Post-process response to ensure agent identity and role are maintained
        response_content = _enforce_agent_identity(response_content, final_agent_name, final_agent_role)
        
        # Store agent knowledge
        await memory_manager._store_agent_knowledge(agent_id, user_id, query, response_content)
        
        logger.info(f"Chat completed for user:{user_id}, agent:{agent_id}, agent_name:{final_agent_name}, agent_role:{final_agent_role}")
        return response_content
        
    except Exception as e:
        logger.error(f"Chat failed for user:{user_id}, agent:{agent_id}: {e}")
        raise

async def stream_chat(user_id: str, agent_id: str, query: str, agent_instructions: Optional[str] = None, agent_name: Optional[str] = None, agent_role: Optional[str] = None, protocol_metadata: Optional[Dict] = None, agent_description: Optional[str] = None, ai_model_name: Optional[str] = None, ai_model_provider: Optional[str] = None, files: Optional[List] = None):
    """Enhanced streaming chat with PostgreSQL memory system and token tracking using latest Agno patterns"""
    try:
        # Extract final agent name and role for metadata
        final_agent_name = agent_name or memory_manager._extract_agent_name(agent_instructions)
        final_agent_role = agent_role or "AI Assistant"
        
        # Log protocol execution if present
        if protocol_metadata:
            logger.info(f"Protocol execution: {protocol_metadata.get('protocol_name', 'Unknown')} (Level {protocol_metadata.get('protocol_level', 'Unknown')})")
        
        # Get agent with PostgreSQL-backed memory and latest Agno patterns
        agent = memory_manager._get_agent(user_id, agent_id, agent_instructions, agent_name, agent_role, protocol_metadata, agent_description, ai_model_name, ai_model_provider)
        
        # Build media payload from signed URLs.
        # OpenAI Chat expects images as image_url parts, not generic file_data parts.
        formattedSignedUrls = []
        formattedImages = []
        if files:
            signed_urls_with_metadata = await generate_signed_url_with_metadata(files)
            for file_data in signed_urls_with_metadata:
                signed_url = file_data.get('signed_url')
                content_type = (file_data.get('content_type') or '').lower()

                if not signed_url:
                    continue

                if content_type.startswith('image/'):
                    # Send images through the image channel so Agno formats `image_url`.
                    formattedImages.append(Image(url=signed_url))
                else:
                    # Keep non-image assets as generic files (e.g. PDFs).
                    formattedSignedUrls.append(File(url=signed_url, mime_type=content_type or None))

        # Enrich query with context
        enriched_query = await memory_manager._enrich_context(agent, user_id, query, protocol_metadata)


        # Run agent with user_id for proper memory handling
        response = agent.run(
            enriched_query,
            user_id=user_id,
            images=formattedImages if formattedImages else None,
            files=formattedSignedUrls if formattedSignedUrls else None,
        )
        response_content = getattr(response, 'content', str(response))
        
        # Post-process response to ensure agent identity and role are maintained
        response_content = _enforce_agent_identity(response_content, final_agent_name, final_agent_role)
        
        # Try to get actual token usage from response
        actual_tokens = None
        if hasattr(response, 'usage'):
            actual_tokens = {
                'total_tokens': getattr(response.usage, 'total_tokens', 0),
                'prompt_tokens': getattr(response.usage, 'prompt_tokens', 0),
                'completion_tokens': getattr(response.usage, 'completion_tokens', 0)
            }
        elif hasattr(response, 'metrics') and hasattr(response.metrics, 'tokens'):
            actual_tokens = {
                'total_tokens': getattr(response.metrics.tokens, 'total', 0),
                'prompt_tokens': getattr(response.metrics.tokens, 'input', 0),
                'completion_tokens': getattr(response.metrics.tokens, 'output', 0)
            }
        
        # Use actual tokens if available, otherwise estimate
        if actual_tokens and actual_tokens['total_tokens'] > 0:
            token_data = actual_tokens
            logger.info(f"Using actual token usage: {actual_tokens}")
        else:
            # Fallback to estimation
            input_text = enriched_query + (agent_instructions or "")
            estimated_input_tokens = len(input_text.split()) * 1.3
            estimated_output_tokens = len(response_content.split()) * 1.3
            total_tokens = estimated_input_tokens + estimated_output_tokens
            
            token_data = {
                'total_tokens': int(total_tokens),
                'prompt_tokens': int(estimated_input_tokens),
                'completion_tokens': int(estimated_output_tokens)
            }
            logger.info(f"Using estimated token usage: {token_data}")
        
        # Store token usage and metadata with role information
        response_metadata = {
            **token_data,
            'agent_name': final_agent_name,
            'agent_role': final_agent_role,
            'agent_id': agent_id,
            'model_used': 'gpt-4o-mini',
            'user_id': user_id,
            'storage_type': 'postgresql',
            'monitoring_enabled': bool(AGNO_API_KEY and AGNO_MONITOR),  # Actual monitoring status
            'dashboard_url': 'https://app.agno.com/sessions' if AGNO_API_KEY else None,
            'estimation_used': actual_tokens is None
        }
        
        # Simulate streaming by yielding chunks
        chunk_size = 5
        for i in range(0, len(response_content), chunk_size):
            chunk = response_content[i:i + chunk_size]
            yield chunk
            # Small delay to simulate streaming
            await asyncio.sleep(0.1)
        
        # Yield metadata as final chunk
        yield response_metadata
        
        # Store agent knowledge
        await memory_manager._store_agent_knowledge(agent_id, user_id, query, response_content)
        
        logger.info(f"Stream chat completed for user:{user_id}, agent:{agent_id}, agent_name:{final_agent_name}, agent_role:{final_agent_role} - Tokens: {token_data['total_tokens']} ({'estimated' if response_metadata.get('estimation_used') else 'actual'})")
        
    except Exception as e:
        logger.error(f"Stream chat failed for user:{user_id}, agent:{agent_id}: {e}")
        raise

async def get_memory_summary(user_id: str, agent_id: str) -> Dict:
    """Get comprehensive memory summary with PostgreSQL statistics"""
    try:
        user_memory = memory_manager._get_user_memory(user_id)
        agent_memory = memory_manager._get_agent_memory(agent_id)
        
        # Get memory statistics
        user_stats = await user_memory.get_memory_stats(user_id)
        agent_stats = await agent_memory.get_memory_stats(user_id)
        
        # Get recent memories
        user_memories = await user_memory.get_user_memories(user_id, limit=10)
        agent_memories = await agent_memory.get_user_memories(user_id, limit=10)
        
        return {
            "user": {
                **user_stats,
                "recent_topics": [mem.get('content', '')[:50] + "..." for mem in user_memories[:5]]
            },
            "agent": {
                **agent_stats,
                "expertise_areas": [mem.get('content', '')[:50] + "..." for mem in agent_memories[:5]]
            },
            "memory_type": "postgresql_enhanced",
            "storage_backend": "PostgreSQL with Agno Memory v2"
        }
        
    except Exception as e:
        logger.error(f"Failed to get memory summary: {e}")
        return {"user": {}, "agent": {}, "error": str(e), "memory_type": "error"}

async def generate_signed_urls(files: Optional[List] = None) -> List[str]:
    """Generate signed URLs for file access (stub implementation)"""
    if not files:
        return []
    
    if not all([S3_BUCKET_NAME, S3_REGION, S3_ACCESS_KEY, S3_SECRET_KEY]):
        logger.error("S3 configuration incomplete - missing required environment variables")
        return []
    # In a real implementation, generate signed URLs using your storage provider (e.g., AWS S3, GCP, Azure)
    try:
        # Initialize S3 client
        s3_client = boto3.client(
            's3',
            region_name=S3_REGION,
            aws_access_key_id=S3_ACCESS_KEY,
            aws_secret_access_key=S3_SECRET_KEY
        )
        
        signed_urls = []
        
        for file in files:
            try:
                file_path = file.get('uniqueName')
                if not file_path:
                    logger.warning(f"No uniqueName found for file: {file}")
                    continue
                
                # Generate signed URL (valid for 1 hour)
                signed_url = s3_client.generate_presigned_url(
                    'get_object',
                    Params={
                        'Bucket': S3_BUCKET_NAME,
                        'Key': file_path
                    },
                    ExpiresIn=3600  # 1 hour
                )
                
                signed_urls.append(signed_url)
                logger.info(f"Generated signed URL for file: {file_path}")
                
            except ClientError as e:
                logger.error(f"Failed to generate signed URL for file {file.get('uniqueName', 'unknown')}: {e}")
                continue
            except Exception as e:
                logger.error(f"Unexpected error generating signed URL for file {file.get('uniqueName', 'unknown')}: {e}")
                continue
        
        logger.info(f"Generated {len(signed_urls)} signed URLs out of {len(files)} files")
        return signed_urls
        
    except NoCredentialsError:
        logger.error("AWS credentials not found or invalid")
        return []
    except Exception as e:
        logger.error(f"Failed to initialize S3 client or generate signed URLs: {e}")
        return []

async def generate_signed_url_with_metadata(files: Optional[List] = None) -> List[Dict]:
    """Generate signed URLs with file metadata for better agent context"""
    if not files:
        return []
    
    # Validate S3 configuration
    if not all([S3_BUCKET_NAME, S3_REGION, S3_ACCESS_KEY, S3_SECRET_KEY]):
        logger.error("S3 configuration incomplete - missing required environment variables")
        return []
    
    try:
        # Initialize S3 client
        s3_client = boto3.client(
            's3',
            region_name=S3_REGION,
            aws_access_key_id=S3_ACCESS_KEY,
            aws_secret_access_key=S3_SECRET_KEY
        )
        
        file_data = []
        
        for file in files:
            try:
                file_path = file.get('uniqueName')
                original_name = file.get('originalName', file_path)
                
                if not file_path:
                    logger.warning(f"No uniqueName found for file: {file}")
                    continue
                
                # Generate signed URL (valid for 1 hour)
                signed_url = s3_client.generate_presigned_url(
                    'get_object',
                    Params={
                        'Bucket': S3_BUCKET_NAME,
                        'Key': file_path
                    },
                    ExpiresIn=3600  # 1 hour
                )
                
                # Get file metadata
                try:
                    head_response = s3_client.head_object(Bucket=S3_BUCKET_NAME, Key=file_path)
                    file_size = head_response.get('ContentLength', 0)
                    content_type = head_response.get('ContentType', 'application/octet-stream')
                    last_modified = head_response.get('LastModified')
                except ClientError:
                    file_size = 0
                    content_type = 'application/octet-stream'
                    last_modified = None
                
                file_info = {
                    'signed_url': signed_url,
                    'original_name': original_name,
                    'unique_name': file_path,
                    'content_type': content_type,
                    'file_size': file_size,
                    'last_modified': last_modified.isoformat() if last_modified else None,
                    'expires_in': 3600  # seconds
                }
                
                file_data.append(file_info)
                logger.info(f"Generated signed URL with metadata for file: {original_name} ({file_path})")
                
            except ClientError as e:
                logger.error(f"Failed to generate signed URL for file {file.get('uniqueName', 'unknown')}: {e}")
                continue
            except Exception as e:
                logger.error(f"Unexpected error generating signed URL for file {file.get('uniqueName', 'unknown')}: {e}")
                continue
        
        logger.info(f"Generated {len(file_data)} signed URLs with metadata out of {len(files)} files")
        return file_data
        
    except NoCredentialsError:
        logger.error("AWS credentials not found or invalid")
        return []
    except Exception as e:
        logger.error(f"Failed to initialize S3 client or generate signed URLs: {e}")
        return []
