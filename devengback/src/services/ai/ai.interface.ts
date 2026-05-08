import { SystemPromptOptions } from './system-prompt.service';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'function' | 'tool';
  content: string;
  tool_call_id?: string;
  name?: string;
}

export interface GenerationOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  jsonSchema?: Record<string, any>;
  previousResponseId?: string;
  enableWebSearch?: boolean;
}

export interface GenerationRequest {
  prompt: string;
  messages: ChatMessage[];
  systemPrompt: string;
  options?: GenerationOptions;
}

export interface GenerationResponse {
  content: string;
  model: string;
  provider: string;
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export interface StreamResponse {
  stream: any;
  totalTokens?: number;
  metadata?: {
    model: string;
    provider: string;
  };
}

export interface AIService {
  generateContent(request: GenerationRequest): Promise<GenerationResponse>;
  streamContent(request: GenerationRequest): Promise<StreamResponse>;
}

export interface AIServiceFactory {
  getService(): AIService;
}
