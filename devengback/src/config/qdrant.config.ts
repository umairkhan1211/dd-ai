import dotenv from 'dotenv';

dotenv.config();

export interface QdrantConfig {
  uri: string;
  collectionName: string;
  dimension: number;
  distance: 'Cosine' | 'Euclid' | 'Dot';
  timeout: number;
}

// const qdrantConfig: QdrantConfig = {
//   uri: process.env.QDRANT_URI || 'http://localhost:6333',
//   collectionName: process.env.QDRANT_COLLECTION_NAME || 'deviation_engine',
//   dimension: parseInt(process.env.QDRANT_VECTOR_DIMENSION || '768', 10),
//   distance: (process.env.QDRANT_DISTANCE || 'Cosine') as 'Cosine' | 'Euclid' | 'Dot',
//   timeout: parseInt(process.env.QDRANT_TIMEOUT || '5000', 10),
// };

// export default qdrantConfig; 