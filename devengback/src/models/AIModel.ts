import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface IAIModel {
  id: string;
  name: string;
  displayName: string;
  provider: string;
  modelType: 'text' | 'image' | 'code' | 'multimodal';
  modelTier: 'budget' | 'standard' | 'premium';
  maxTokens?: number;
  inputCostPerToken: number;
  outputCostPerToken: number;
  duckCostMultiplier: number;
  capabilities?: string[];
  tierAccess: string[];
  isActive: boolean;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AIModelCreationAttributes
  extends Optional<
    IAIModel,
    'id' | 'maxTokens' | 'capabilities' | 'description' | 'modelTier' | 'createdAt' | 'updatedAt'
  > {}

class AIModel extends Model<IAIModel, AIModelCreationAttributes> implements IAIModel {
  declare id: string;
  declare name: string;
  declare displayName: string;
  declare provider: string;
  declare modelType: 'text' | 'image' | 'code' | 'multimodal';
  declare modelTier: 'budget' | 'standard' | 'premium';
  declare maxTokens?: number;
  declare inputCostPerToken: number;
  declare outputCostPerToken: number;
  declare duckCostMultiplier: number;
  declare capabilities?: string[];
  declare tierAccess: string[];
  declare isActive: boolean;
  declare description?: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  supportsType(type: 'text' | 'image' | 'code' | 'multimodal'): boolean {
    return this.modelType === type || this.modelType === 'multimodal';
  }
}

AIModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'display_name',
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    modelType: {
      type: DataTypes.ENUM('text', 'image', 'code', 'multimodal'),
      allowNull: false,
      defaultValue: 'text',
      field: 'model_type',
    },
    modelTier: {
      type: DataTypes.ENUM('budget', 'standard', 'premium'),
      allowNull: false,
      defaultValue: 'standard',
      field: 'model_tier',
    },
    maxTokens: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'max_tokens',
    },
    inputCostPerToken: {
      type: DataTypes.DECIMAL(10, 6),
      allowNull: false,
      defaultValue: 0,
      field: 'input_cost_per_token',
    },
    outputCostPerToken: {
      type: DataTypes.DECIMAL(10, 6),
      allowNull: false,
      defaultValue: 0,
      field: 'output_cost_per_token',
    },
    duckCostMultiplier: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      defaultValue: 1.0,
      field: 'duck_cost_multiplier',
    },
    capabilities: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    tierAccess: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: ['trial', 'core', 'pro'],
      field: 'tier_access',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'AIModel',
    tableName: 'ai_models',
    underscored: true,
  }
);

export default AIModel;
