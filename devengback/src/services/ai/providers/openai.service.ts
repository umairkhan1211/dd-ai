import { OpenAI } from 'openai';
import openaiConfig from '../../../config/openai.config';
import systemPromptService from '../system-prompt.service';
import {
  AIService,
  ChatMessage,
  GenerationRequest,
  GenerationResponse,
  StreamResponse,
} from '../ai.interface';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions.mjs';

export class OpenAIService implements AIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: openaiConfig.apiKey,
    });
  }

  async generateContent(request: GenerationRequest): Promise<GenerationResponse> {
    try {
      const { prompt, messages, systemPrompt } = request;

      const messagesToUse = [
        { role: 'system', content: systemPrompt },
        ...messages.map((m: ChatMessage) => ({
          role: m.role,
          content: typeof m.content !== 'string' ? JSON.stringify(m.content) : m.content,
          ...(m.name ? { name: m.name } : {}),
        })),
        { role: 'user', content: prompt },
      ];

      const completion = await this.client.chat.completions.create({
        model: openaiConfig.defaultModel,
        messages: messagesToUse as ChatCompletionMessageParam[],
        temperature: openaiConfig.temperature,
        max_tokens: openaiConfig.maxTokens,
        frequency_penalty: openaiConfig.frequencyPenalty,
        presence_penalty: openaiConfig.presencePenalty,
      });

      const content = completion.choices[0].message.content || '';

      return {
        content: content,
        model: completion.model,
        provider: 'openai',
        tokenUsage: {
          prompt: completion.usage?.prompt_tokens || 0,
          completion: completion.usage?.completion_tokens || 0,
          total: completion.usage?.total_tokens || 0,
        },
      };
    } catch (error) {
      console.error('OpenAI generation error:', error);
      throw new Error(`OpenAI content generation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Stream content generation with support for JSON schema output and tools
   * @param options Configuration for the stream request
   * @returns Stream of OpenAI chat completion chunks
   */
  async streamContent(request: GenerationRequest): Promise<StreamResponse> {
    try {
      const { systemPrompt, messages, options, prompt } = request;

      // Build the input messages array correctly for Responses API
      const inputMessages = [
        ...messages.map((m: ChatMessage) => ({
          role: m.role,
          content: typeof m.content !== 'string' ? JSON.stringify(m.content) : m.content,
          ...(m.name ? { name: m.name } : {}),
        })),
        { role: 'user', content: prompt },
      ];

      const streamOptions: any = {
        model: openaiConfig.defaultModel,
        input: inputMessages,
        stream: true,
        instructions: systemPrompt, // Use instructions parameter for system prompt
      };

      // Conditionally add web search tools if enabled
      if (options?.enableWebSearch) {
        streamOptions.tools = [{ type: 'web_search_preview' }];
      }

      // Handle JSON schema output correctly for Responses API
      if (options?.jsonSchema) {
        streamOptions.text = {
          format: {
            type: 'json_schema',
            name: 'json_schema',
            strict: true,
            schema: options.jsonSchema,
          },
        };
      }

      // Add previous response ID for conversation continuity if available
      if (options?.previousResponseId) {
        // streamOptions.previous_response_id = options.previousResponseId;
      }

      console.log(`Streaming with model ${openaiConfig.defaultModel}`);
      console.log('Stream options:', JSON.stringify(streamOptions, null, 2));

      const stream = await this.client.responses.create(streamOptions);

      return {
        stream,
        metadata: {
          model: openaiConfig.defaultModel,
          provider: 'openai',
        },
      };
    } catch (error) {
      console.error('OpenAI streaming error:', error);
      throw new Error(`OpenAI streaming failed: ${(error as Error).message}`);
    }
  }
}
