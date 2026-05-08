export type TaskType = 'search_query' | 'search_document' | 'clustering' | 'classification';

class EmbedderService {
  private extractor: any;
  private isReady: boolean = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.initPromise = this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      const { pipeline } = await import('@xenova/transformers');
      
      this.extractor = await pipeline('feature-extraction', 'nomic-ai/nomic-embed-text-v1', {
        quantized: false, // Set to true for smaller model size but potentially lower quality
      });
      this.isReady = true;
      console.log('Embedding model loaded successfully');
    } catch (error) {
      console.error('Failed to initialize embedding model:', error);
      throw error;
    }
  }

  /**
   * Ensures the model is loaded before attempting to use it
   */
  private async ensureReady(): Promise<void> {
    if (!this.isReady && this.initPromise) {
      await this.initPromise;
    }
    
    if (!this.isReady) {
      throw new Error('Embedding model failed to initialize');
    }
  }

  /**
   * Embeds a single text with the specified task type
   * @param text The text to embed
   * @param taskType The task type prefix to use
   * @returns The embedding vector
   */
  public async embedText(text: string, taskType: TaskType): Promise<number[]> {
    await this.ensureReady();
    
    const formattedText = `${taskType}: ${text}`;
    const result = await this.extractor(formattedText, { 
      pooling: 'mean',
      normalize: true 
    });
    
    return Array.from(result.data);
  }

  /**
   * Embeds multiple texts with the specified task type
   * @param texts Array of texts to embed
   * @param taskType The task type prefix to use
   * @returns Array of embedding vectors
   */
  public async embedTexts(texts: string[], taskType: TaskType): Promise<number[][]> {
    await this.ensureReady();
    
    const formattedTexts = texts.map(text => `${taskType}: ${text}`);
    const result = await this.extractor(formattedTexts, { 
      pooling: 'mean',
      normalize: true 
    });
    
    return result.map((embedding: { data: any }) => Array.from(embedding.data));
  }

  /**
   * Embeds text specifically for search queries
   * @param text The search query text
   * @returns The embedding vector
   */
  public async embedQuery(text: string): Promise<number[]> {
    return this.embedText(text, 'search_query');
  }

  /**
   * Embeds text specifically for document indexing
   * @param text The document text
   * @returns The embedding vector
   */
  public async embedDocument(text: string): Promise<number[]> {
    return this.embedText(text, 'search_document');
  }

  /**
   * Calculates cosine similarity between two embedding vectors
   * @param vec1 First embedding vector
   * @param vec2 Second embedding vector
   * @returns Cosine similarity score (between -1 and 1)
   */
  public cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) {
      throw new Error('Vectors must have the same dimensions');
    }

    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      mag1 += vec1[i] * vec1[i];
      mag2 += vec2[i] * vec2[i];
    }

    mag1 = Math.sqrt(mag1);
    mag2 = Math.sqrt(mag2);

    if (mag1 === 0 || mag2 === 0) {
      return 0;
    }

    return dotProduct / (mag1 * mag2);
  }
}

const embedder = new EmbedderService();
export default embedder;