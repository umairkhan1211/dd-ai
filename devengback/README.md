# Deviation Engine Backend

## Environment Variables

The following environment variables are required to configure the backend:

### Server Configuration
- `NODE_ENV` - Environment (development, test, production)
- `PORT` - Server port

### Database Configuration
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `DB_HOST` - Database host
- `DB_PORT` - Database port

### AI Configuration
- `OPENAI_API_KEY` - OpenAI API key
- `OPENAI_MODEL` - OpenAI model to use
- `OPENAI_TEMPERATURE` - Model temperature
- `OPENAI_MAX_TOKENS` - Maximum tokens for model responses
- `OPENAI_FREQUENCY_PENALTY` - Frequency penalty for model
- `OPENAI_PRESENCE_PENALTY` - Presence penalty for model

### Qdrant Vector Database Configuration
- `QDRANT_URI` - URI for Qdrant service (default: http://localhost:6333)
- `QDRANT_COLLECTION_NAME` - Collection name for vectors (default: semantic_store)
- `QDRANT_VECTOR_DIMENSION` - Dimension of vectors (default: 1536)
- `QDRANT_DISTANCE` - Distance metric (default: Cosine)
- `QDRANT_TIMEOUT` - Connection timeout in ms (default: 5000)

## Setup

1. Create a `.env` file with the above variables
2. Install dependencies: `npm install`
3. Run migrations: `npm run migrate`
4. Start the server: `npm run dev`

## Docker

The project includes Docker configuration for development and production environments.
To use Docker:

1. Make sure Docker and Docker Compose are installed
2. Create a `.env` file in the `deploy` directory
3. Run `docker-compose up -d` from the deploy directory

## Services

### Vector Store Service

The Vector Store service provides an interface to interact with the Qdrant vector database.
It supports storing, searching, and managing vector embeddings.

Example usage:

```typescript
import vectorStore from './services/vector-store.service';

// Initialize the service
await vectorStore.init();

// Store vectors
const embeddings = [[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]];
const payloads = [
  { metadata: { source: 'document1', text: 'Hello world' } },
  { metadata: { source: 'document2', text: 'Goodbye world' } }
];
await vectorStore.upsert(embeddings, payloads);

// Search vectors
const query = [0.2, 0.3, 0.4];
const results = await vectorStore.search(query, 5);
```

### Embedder Service

The Embedder service uses the Nomic embeddings model (Xenova/nomic-embed-text-v1) to generate 768-dimensional vector embeddings from text.

Example usage:

```typescript
import embedder from './services/embedder.service';

// Initialize the service
await embedder.init();

// Generate embedding for a single text
const text = "Hello, how can I help you today?";
const embedding = await embedder.embed(text);

// Generate embeddings for multiple texts
const texts = ["Hello world", "Goodbye world"];
const embeddings = await embedder.embedBatch(texts);
```

### Memory Service

The Memory service provides a way to store and retrieve chat messages with semantic search capabilities.
It combines the Vector Store and Embedder services to create a semantic memory system.

Example usage:

```typescript
import memory from './services/memory.service';

// Initialize the service
await memory.init();

// Store a memory
const entry = {
  chatId: "chat123",
  role: "user",
  content: "What is the capital of France?",
  timestamp: Date.now()
};
const id = await memory.storeMemory(entry);

// Search for semantically similar memories
const query = "Tell me about the capital city";
const results = await memory.searchMemories("chat123", query, 5);

// Get all memories for a chat
const allMemories = await memory.getChatMemories("chat123");

// Delete all memories for a chat
await memory.deleteChatMemories("chat123");
```

### Template Service

The Template service provides Jinja2-like templating functionality using Nunjucks. This enables dynamic generation of prompts and other text with variables and logic.

Example usage:

```typescript
import templateService from './services/template.service';

// Render a template file with context
const rendered = templateService.render('system.njk', {
  company_name: 'DevCorp',
  assistant_name: 'DevBot'
});

// Render a template string
const templateString = 'Hello, {{ name }}!';
const rendered = templateService.renderString(templateString, { name: 'User' });

// Save a new template
templateService.saveTemplate('custom.njk', 'This is a {{ adjective }} template!');

// List available templates
const templates = templateService.listTemplates();
```

### System Prompt Service

The System Prompt service generates system prompts for AI models using templates. It allows for consistent, maintainable prompts that can include dynamic content.

Example usage:

```typescript
import systemPromptService from './services/ai/system-prompt.service';

// Generate a system prompt using the default template
const systemPrompt = systemPromptService.generateSystemPrompt({
  company_name: 'DevCorp',
  assistant_name: 'DevBot',
  user: {
    id: 'user123',
    name: 'John',
    created_at: '2023-01-01'
  },
  guidelines: [
    'Be concise',
    'Use simple language'
  ]
});

// Generate a prompt from a custom template string
const templateString = 'You are {{ assistant_name }}. Please help {{ user.name }}.';
const prompt = systemPromptService.generateFromTemplate(templateString, {
  assistant_name: 'DevBot',
  user: { name: 'John', id: 'user123', created_at: new Date() }
});

// Save a custom template
systemPromptService.saveTemplate('custom_assistant', 'You are {{ assistant_name }} specializing in {{ specialty }}.');

// List available templates
const templates = systemPromptService.listTemplates();
```

## MongoDB to PostgreSQL Migration

This project has been migrated from MongoDB to PostgreSQL. Here's what you need to know:

### Setup Instructions

1. **Install PostgreSQL**:
   Make sure you have PostgreSQL installed on your system. You can download it from [postgresql.org](https://www.postgresql.org/download/) or use a package manager.

2. **Environment Variables**:
   Update your `.env` file with PostgreSQL configuration:
   ```
   # Database Configuration (PostgreSQL)
   DB_NAME=deviation_engine
   # On macOS, the default PostgreSQL user is often your system username
   DB_USER=your_username
   DB_PASSWORD=yourpassword
   DB_HOST=localhost
   DB_PORT=5432
   ```
   
   Note: On macOS, if you installed PostgreSQL with Homebrew, the default user is often your system username and may not require a password for local development.

3. **Create Database and Run Migrations**:
   ```
   npm run db:create
   ```
   This will create the database and run all migrations.

4. **Start the Server**:
   ```
   npm run dev
   ```

### Database Model Changes

The data models have been converted from Mongoose to Sequelize:

- **User**: User accounts and authentication
- **Template**: Content templates stored by users
- **AIUsage**: Tracking of AI usage per user per day

### Additional Commands

- **Run Migrations**:
  ```
  npm run db:migrate
  ```

- **Undo Last Migration**:
  ```
  npm run db:migrate:undo
  ```

- **Run Seeders**:
  ```
  npm run db:seed
  ```

## API Endpoints

The API endpoints remain the same, but now use PostgreSQL as the database backend.

## Logging

This application uses Winston for structured logging with the following features:

- **Log Levels**: error, warn, info, http, debug
- **Output Destinations**:
  - Console output (colorized for better readability)
  - File output to `logs/all.log` for all logs 
  - File output to `logs/error.log` for error-level logs only

- **HTTP Request Logging**: All incoming HTTP requests are logged with method, URL, status code, and response time
- **Database Query Logging**: SQL queries are logged at debug level

Log files are stored in the `logs/` directory at the project root. 