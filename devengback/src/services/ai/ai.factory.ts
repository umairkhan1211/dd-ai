import { AIService, AIServiceFactory } from './ai.interface';
import { OpenAIService } from './providers/openai.service';

/**
 * AI Service Provider Types
 */
export type AIProvider = 'openai' | 'anthropic' | 'mistral' | 'custom';

/**
 * Factory for creating AI services
 */
export class AIServiceFactoryImpl implements AIServiceFactory {
  private providerType: AIProvider;
  private serviceCache: Map<AIProvider, AIService>;

  constructor(providerType: AIProvider = 'openai') {
    this.providerType = providerType;
    this.serviceCache = new Map();
  }

  /**
   * Get the configured AI service
   */
  getService(): AIService {
    // Check if we already have an instance for this provider
    const cachedService = this.serviceCache.get(this.providerType);
    if (cachedService) {
      return cachedService;
    }

    // Create a new service based on the provider type
    let service: AIService;

    switch (this.providerType) {
      case 'openai':
        service = new OpenAIService();
        break;
      // Add more providers here as they are implemented
      // case 'anthropic':
      //   service = new AnthropicService();
      //   break;
      // case 'mistral':
      //   service = new MistralService();
      //   break;
      default:
        // Default to OpenAI
        service = new OpenAIService();
    }

    // Cache the service for future use
    this.serviceCache.set(this.providerType, service);

    return service;
  }

  /**
   * Change the AI provider
   */
  setProvider(providerType: AIProvider): void {
    this.providerType = providerType;
  }
}

// Create a singleton instance of the factory
const aiFactory = new AIServiceFactoryImpl();

export default aiFactory;
