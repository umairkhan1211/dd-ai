// import { randomUUID } from 'crypto';
// import logger from '../utils/logger';
// import embedder, { TaskType } from './embedder.service';
// // import vectorStore, { VectorPayload } from './vector-store.service';

// export interface MemoryEntry {
//   id?: string;
//   chatId: string;
//   role: 'user' | 'assistant' | 'system';
//   content: string;
//   timestamp: number;
//   metadata?: Record<string, any>;
// }

// // Define the Qdrant search result type
// interface QdrantSearchResult {
//   id: string | number;
//   score: number;
//   payload?: {
//     metadata?: {
//       chatId?: string;
//       role?: 'user' | 'assistant' | 'system';
//       timestamp?: number;
//       [key: string]: any;
//     };
//     content?: string;
//     [key: string]: any;
//   };
//   vector?: number[];
// }

// /**
//  * Memory service for storing and retrieving chat messages with semantic search
//  */
// export class MemoryService {
//   private initialized = false;

//   /**
//    * Initialize the memory service
//    */
//   async init(): Promise<void> {
//     if (this.initialized) return;

//     try {
//       // Initialize dependent services
//       await vectorStore.init();
      
//       this.initialized = true;
//       logger.info('Memory service initialized successfully');
//     } catch (error) {
//       logger.error('Failed to initialize memory service:', error);
//       throw new Error('Failed to initialize memory service');
//     }
//   }

//   /**
//    * Store a memory entry
//    */
//   async storeMemory(entry: MemoryEntry, taskType: TaskType = 'search_document'): Promise<string> {
//     if (!this.initialized) await this.init();
    
//     try {
//       const id = entry.id || randomUUID();
      
//       const embedding = await embedder.embedText(entry.content, taskType);
      
//       const payload: VectorPayload = {
//         id,
//         metadata: {
//           chatId: entry.chatId,
//           role: entry.role,
//           timestamp: entry.timestamp,
//           ...(entry.metadata || {})
//         },
//         content: entry.content
//       };
      
//       // Store in vector store
//       await vectorStore.upsert([embedding], [payload], [id]);
      
//       return id;
//     } catch (error) {
//       logger.error('Error storing memory:', error);
//       throw new Error('Failed to store memory');
//     }
//   }

//   /**
//    * Store multiple memory entries in batch
//    */
//   async storeMemoryBatch(entries: MemoryEntry[], taskType: TaskType = 'search_document'): Promise<string[]> {
//     if (!this.initialized) await this.init();
    
//     try {
//       const ids = entries.map(entry => entry.id || randomUUID());
//       const contents = entries.map(entry => entry.content);
//       const embeddings = await embedder.embedTexts(contents, taskType);

//       const payloads: VectorPayload[] = entries.map((entry, i) => ({
//         id: ids[i],
//         metadata: {
//           chatId: entry.chatId,
//           role: entry.role,
//           timestamp: entry.timestamp,
//           ...(entry.metadata || {})
//         },
//         content: entry.content
//       }));
      
//       // Store in vector store
//       await vectorStore.upsert(embeddings, payloads, ids);
      
//       return ids;
//     } catch (error) {
//       logger.error('Error storing memory batch:', error);
//       throw new Error('Failed to store memory batch');
//     }
//   }

//   /**
//    * Search for semantically similar memories
//    */
//   async searchMemories(
//     chatId: string,
//     query: string,
//     limit: number = 5
//   ): Promise<MemoryEntry[]> {
//     if (!this.initialized) await this.init();
    
//     try {
//       const queryEmbedding = await embedder.embedQuery(query);
      
//       const results = await vectorStore.search(
//         queryEmbedding,
//         limit,
//         { chatId }
//       ) as QdrantSearchResult[];

//       return results
//         .filter(result => 
//           result.payload && 
//           result.payload.metadata && 
//           result.payload.content &&
//           typeof result.payload.content === 'string' &&
//           result.payload.metadata.chatId &&
//           result.payload.metadata.role &&
//           result.payload.metadata.timestamp
//         )
//         .map(result => ({
//           id: String(result.id),
//           chatId: result.payload!.metadata!.chatId as string,
//           role: result.payload!.metadata!.role as 'user' | 'assistant' | 'system',
//           content: result.payload!.content as string,
//           timestamp: result.payload!.metadata!.timestamp as number,
//           metadata: { ...result.payload!.metadata }
//         }));
//     } catch (error) {
//       logger.error('Error searching memories:', error);
//       throw new Error('Failed to search memories');
//     }
//   }

//   /**
//    * Get all memories for a specific chat
//    */
//   async getChatMemories(chatId: string): Promise<MemoryEntry[]> {
//     if (!this.initialized) await this.init();
    
//     try {
//       // Perform a search with a filter but no semantic similarity
//       // This is a limitation of the current implementation and could be improved
//       // with a dedicated "getAll" endpoint in the vector store
//       const dummyVector = new Array(768).fill(0);
//       const results = await vectorStore.search(
//         dummyVector,
//         1000, // Large limit to get all entries
//         { chatId }
//       ) as QdrantSearchResult[];
      
//       // Convert results to memory entries and sort by timestamp
//       return results
//         .filter(result => 
//           result.payload && 
//           result.payload.metadata && 
//           result.payload.content &&
//           typeof result.payload.content === 'string' &&
//           result.payload.metadata.chatId &&
//           result.payload.metadata.role &&
//           result.payload.metadata.timestamp
//         )
//         .map(result => ({
//           id: String(result.id),
//           chatId: result.payload!.metadata!.chatId as string,
//           role: result.payload!.metadata!.role as 'user' | 'assistant' | 'system',
//           content: result.payload!.content as string,
//           timestamp: result.payload!.metadata!.timestamp as number,
//           metadata: { ...result.payload!.metadata }
//         }))
//         .sort((a, b) => a.timestamp - b.timestamp);
//     } catch (error) {
//       logger.error('Error getting chat memories:', error);
//       throw new Error('Failed to get chat memories');
//     }
//   }

//   /**
//    * Delete all memories for a specific chat
//    */
//   async deleteChatMemories(chatId: string): Promise<void> {
//     if (!this.initialized) await this.init();
    
//     try {
//       // First get all memories for the chat to get their IDs
//       const memories = await this.getChatMemories(chatId);
      
//       if (memories.length > 0) {
//         // Extract IDs and delete from vector store
//         const ids = memories.map(memory => memory.id as string);
//         await vectorStore.delete(ids);
//         logger.info(`Deleted ${ids.length} memories for chat ${chatId}`);
//       }
//     } catch (error) {
//       logger.error(`Error deleting chat memories for ${chatId}:`, error);
//       throw new Error('Failed to delete chat memories');
//     }
//   }
// }

// // Export a singleton instance
// export const memory = new MemoryService();
// export default memory; 