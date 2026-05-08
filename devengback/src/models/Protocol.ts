import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import { IAIModel } from './AIModel';

export interface IProtocol {
  id: string;
  userId?: string | null;
  name: string;
  description: string;
  level: 1 | 2 | 3; // Protocol complexity level
  type: 'static' | 'semi-dynamic' | 'compositional'; // Protocol type
  promptTemplate: string; // The base prompt template
  inputs?: {
    name: string;
    type: 'text' | 'select' | 'number' | 'boolean';
    label: string;
    required: boolean;
    options?: string[]; // For select inputs
    placeholder?: string;
    defaultValue?: any;
  }[]; // Input schema for Level 2 & 3
  modifiers?: {
    name: string;
    type: 'select' | 'toggle' | 'slider';
    label: string;
    options?: string[];
    defaultValue?: any;
    min?: number;
    max?: number;
  }[]; // Modifier schema for Level 2 & 3
  logic?: {
    conditions?: {
      field: string;
      operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
      value: any;
      action: string; // What to do if condition is met
    }[];
    iterations?: {
      enabled: boolean;
      maxIterations: number;
      showProgress: boolean;
    };
    chaining?: {
      enabled: boolean;
      steps: {
        name: string;
        promptTemplate: string;
        dependsOn?: string[];
      }[];
    };
  }; // Logic schema for Level 3
  deliveredBy?: string; // Which agent delivers this protocol
  category?: string; // Protocol category for organization
  aiModelId?: string; // AI Model foreign key
  aiModel?: IAIModel; // AI Model relationship
  isActive: boolean; // Whether the protocol is active
  createdAt?: Date;
  updatedAt?: Date;
}

// interface ProtocolCreation extends Optional<IProtocol, 'id' | 'userId' | 'inputs' | 'modifiers' | 'logic' | 'deliveredBy' | 'category' | 'isActive'> {}
interface ProtocolCreation
  extends Optional<
    IProtocol,
    | 'id'
    | 'userId'
    | 'inputs'
    | 'modifiers'
    | 'logic'
    | 'deliveredBy'
    | 'category'
    | 'aiModelId'
    | 'isActive'
  > {}

class Protocol extends Model<IProtocol, ProtocolCreation> implements IProtocol {
  declare id: string;
  declare userId?: string | null;
  declare name: string;
  declare description: string;
  declare level: 1 | 2 | 3;
  declare type: 'static' | 'semi-dynamic' | 'compositional';
  declare promptTemplate: string;
  declare inputs?: {
    name: string;
    type: 'text' | 'select' | 'number' | 'boolean';
    label: string;
    required: boolean;
    options?: string[];
    placeholder?: string;
    defaultValue?: any;
  }[];
  declare modifiers?: {
    name: string;
    type: 'select' | 'toggle' | 'slider';
    label: string;
    options?: string[];
    defaultValue?: any;
    min?: number;
    max?: number;
  }[];
  declare logic?: {
    conditions?: {
      field: string;
      operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
      value: any;
      action: string;
    }[];
    iterations?: {
      enabled: boolean;
      maxIterations: number;
      showProgress: boolean;
    };
    chaining?: {
      enabled: boolean;
      steps: {
        name: string;
        promptTemplate: string;
        dependsOn?: string[];
      }[];
    };
  };
  declare deliveredBy?: string;
  declare category?: string;
  declare aiModelId?: string;
  declare isActive: boolean;
}

Protocol.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isIn: [[1, 2, 3]],
      },
    },
    type: {
      type: DataTypes.ENUM('static', 'semi-dynamic', 'compositional'),
      allowNull: false,
    },
    promptTemplate: { type: DataTypes.TEXT, allowNull: false },
    inputs: { type: DataTypes.JSONB, allowNull: true },
    modifiers: { type: DataTypes.JSONB, allowNull: true },
    logic: { type: DataTypes.JSONB, allowNull: true },
    deliveredBy: { type: DataTypes.STRING, allowNull: true },
    category: { type: DataTypes.STRING, allowNull: true, defaultValue: 'General' },
    aiModelId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'ai_model_id',
    },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  {
    underscored: true,
    sequelize,
    modelName: 'Protocol',
    tableName: 'protocols',
    indexes: [{ unique: true, fields: ['userId', 'name'] }],
  }
);

export default Protocol;
