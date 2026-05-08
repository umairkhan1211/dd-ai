// import { QdrantClient } from '@qdrant/js-client-rest';
// import qdrantConfig from '../config/qdrant.config';
// import logger from '../utils/logger';
// import { randomUUID } from 'crypto';

// export interface VectorPayload {
//   id?: string;
//   metadata: Record<string, any>;
//   [key: string]: any;
// }

// export class VectorStoreService {
//   private client: QdrantClient;
//   private initialized: boolean = false;

//   constructor() {
//     this.client = new QdrantClient({
//       url: qdrantConfig.uri,
//       timeout: qdrantConfig.timeout,
//     });
//   }

//   /**
//    * Initialize the vector store service
//    */
//   async init(): Promise<void> {
//     try {
//       if (this.initialized) return;

//       const collections = await this.client.getCollections();
      
//       // Check if collection exists
//       const collectionExists = collections.collections.some(
//         (collection: { name: string }) => collection.name === qdrantConfig.collectionName
//       );

//       // If not, create it
//       if (!collectionExists) {
//         await this.client.createCollection(qdrantConfig.collectionName, {
//           vectors: {
//             size: qdrantConfig.dimension,
//             distance: qdrantConfig.distance,
//           },
//         });
//         logger.info(`Created Qdrant collection: ${qdrantConfig.collectionName}`);
//       } else {
//         logger.info(`Using existing Qdrant collection: ${qdrantConfig.collectionName}`);
//       }

//       this.initialized = true;
//     } catch (error) {
//       logger.error('Failed to initialize Qdrant vector store:', error);
//       throw new Error('Failed to initialize vector store');
//     }
//   }

//   /**
//    * Store vectors in the database
//    */
//   async upsert(
//     vectors: number[][],
//     payloads: VectorPayload[],
//     ids?: string[]
//   ): Promise<void> {
//     try {
//       if (!this.initialized) await this.init();

//       const points = vectors.map((vector, i) => ({
//         id: ids && ids[i] ? ids[i] : randomUUID(),
//         vector,
//         payload: payloads[i],
//       }));

//       await this.client.upsert(qdrantConfig.collectionName, {
//         points,
//       });
//     } catch (error) {
//       logger.error('Error upserting vectors:', error);
//       throw new Error('Failed to store vectors');
//     }
//   }

//   /**
//    * Search for similar vectors
//    */
//   async search(
//     vector: number[],
//     limit: number = 5,
//     filter?: Record<string, any>,
//     withVectors: boolean = false
//   ) {
//     try {
//       if (!this.initialized) await this.init();

//       const result = await this.client.search(qdrantConfig.collectionName, {
//         vector,
//         limit,
//         filter,
//         with_vector: withVectors,
//       });

//       return result;
//     } catch (error) {
//       logger.error('Error searching vectors:', error);
//       throw new Error('Failed to search vectors');
//     }
//   }

//   /**
//    * Delete vectors from the store
//    */
//   async delete(ids: string[]): Promise<void> {
//     try {
//       if (!this.initialized) await this.init();

//       await this.client.delete(qdrantConfig.collectionName, {
//         points: ids,
//       });
//     } catch (error) {
//       logger.error('Error deleting vectors:', error);
//       throw new Error('Failed to delete vectors');
//     }
//   }

//   /**
//    * Delete a collection
//    */
//   async deleteCollection(): Promise<void> {
//     try {
//       await this.client.deleteCollection(qdrantConfig.collectionName);
//       this.initialized = false;
//       logger.info(`Deleted Qdrant collection: ${qdrantConfig.collectionName}`);
//     } catch (error) {
//       logger.error('Error deleting collection:', error);
//       throw new Error('Failed to delete collection');
//     }
//   }
// }

// // Export a singleton instance
// export const vectorStore = new VectorStoreService();
// export default vectorStore; 