// src/models/AIUsage.ts (Operational Log of AI interactions)
import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface IAIUsage {
  id: string;
  userId: string;
  sessionId?: string; // Link to a specific chat/interaction session
  interactionType: 'chat' | 'image_gen' | 'code_gen' | 'template_ai_fill' | string; // e.g., 'chat_message'
  modelUsed: string; // e.g., 'gpt-4o', 'gemini-pro'
  inputTokens: number; // Number of tokens sent to the AI
  outputTokens: number; // Number of tokens received from the AI
  estimatedDucks: number; // Ducks estimated for the interaction at the start
  actualDucks: number; // Actual ducks consumed for the interaction (final cost)
  status: 'pending' | 'completed' | 'failed' | 'refunded'; // Status of the AI interaction for billing
  aiResponseId?: string; // Optional: ID from the AI service itself (e.g., OpenAI's response ID)
  createdAt?: Date;
  updatedAt?: Date;
}

interface AIUsageCreationAttributes
  extends Optional<
    IAIUsage,
    | 'id'
    | 'sessionId'
    | 'aiResponseId'
    | 'createdAt'
    | 'updatedAt'
    | 'estimatedDucks'
    | 'actualDucks'
    | 'status'
  > {}

class AIUsage extends Model<IAIUsage, AIUsageCreationAttributes> implements IAIUsage {
  declare id: string;
  declare userId: string;
  declare sessionId?: string;
  declare interactionType: 'chat' | 'image_gen' | 'code_gen' | 'template_ai_fill' | string;
  declare modelUsed: string;
  declare inputTokens: number;
  declare outputTokens: number;
  declare estimatedDucks: number;
  declare actualDucks: number;
  declare status: 'pending' | 'completed' | 'failed' | 'refunded';
  declare aiResponseId?: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

AIUsage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    sessionId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'session_id',
    },
    interactionType: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'interaction_type',
    },
    modelUsed: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'model_used',
    },
    inputTokens: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'input_tokens',
    },
    outputTokens: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'output_tokens',
    },
    estimatedDucks: {
      // Re-added
      type: DataTypes.FLOAT, // Use FLOAT for potential fractional duck costs
      allowNull: false,
      defaultValue: 0.0,
      field: 'estimated_ducks',
    },
    actualDucks: {
      // Re-added
      type: DataTypes.FLOAT, // Use FLOAT for potential fractional duck costs
      allowNull: false,
      defaultValue: 0.0,
      field: 'actual_ducks',
    },
    status: {
      // Re-added for tracking billing state
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
      allowNull: false,
      defaultValue: 'pending',
    },
    aiResponseId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'ai_response_id',
    },
  },
  {
    underscored: true,
    sequelize,
    modelName: 'AIUsage',
    tableName: 'ai_usage',
    timestamps: true,
    indexes: [{ fields: ['user_id'] }, { fields: ['session_id'] }],
  }
);

export default AIUsage;
