import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface IChatSession {
  id: string;
  userId: string;
  title?: string;
  meta?: object;
  avatar?: string;
  parentId?: string | null;
  rootId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ChatSessionCreation
  extends Optional<IChatSession, 'id' | 'title' | 'meta' | 'parentId' | 'rootId'> {}

class ChatSession extends Model<IChatSession, ChatSessionCreation> implements IChatSession {
  declare id: string;
  declare userId: string;
  declare title?: string;
  declare meta?: object;
  declare avatar?: string;
  declare parentId?: string | null;
  declare rootId?: string | null;
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

ChatSession.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    title: DataTypes.STRING,
    meta: DataTypes.JSONB,
    avatar: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    parentId: { type: DataTypes.UUID, allowNull: true },
    rootId: { type: DataTypes.UUID, allowNull: true },
  },
  {
    underscored: true,
    sequelize,
    modelName: 'ChatSession',
    tableName: 'chat_sessions',
  }
);

export default ChatSession;
