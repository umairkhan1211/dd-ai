import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import { IAIModel } from './AIModel';

export interface ICastMember {
  id: string;
  userId: string;
  name: string; // Becomes unique
  functionalRole: string; // Renamed from role
  description?: string; // Make optional
  defaultTone: string; // Renamed from tone
  invocationPhrases: string[]; // New field
  priority: number; // New field
  avatar: string;
  aiModelId?: string; // AI Model foreign key
  aiModel?: IAIModel; // AI Model relationship
  isSystem?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CastMemberCreationAttributes
  extends Optional<
    ICastMember,
    | 'id'
    | 'description'
    | 'invocationPhrases'
    | 'priority'
    | 'aiModelId'
    | 'createdAt'
    | 'updatedAt'
  > {}

class Cast extends Model<ICastMember, CastMemberCreationAttributes> implements ICastMember {
  declare id: string;
  declare userId: string;
  declare name: string;
  declare functionalRole: string;
  declare description?: string;
  declare defaultTone: string;
  declare invocationPhrases: string[];
  declare priority: number;
  declare avatar: string;
  declare aiModelId?: string;
  declare isSystem: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Cast.init(
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
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    functionalRole: {
      // Renamed from role
      type: DataTypes.STRING,
      allowNull: false,
      field: 'functional_role',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true, // Now optional
    },
    defaultTone: {
      // Renamed from tone
      type: DataTypes.STRING,
      allowNull: false,
      field: 'default_tone',
    },
    invocationPhrases: {
      // New field
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      field: 'invocation_phrases',
    },
    priority: {
      // New field
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    aiModelId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'ai_model_id',
    },
    isSystem: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_system',
    },
  },
  {
    sequelize,
    modelName: 'Cast',
    tableName: 'cast_members',
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'name'],
        name: 'cast_members_user_id_name_unique',
      },
    ],
  }
);

export default Cast;
