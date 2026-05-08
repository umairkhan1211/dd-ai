// models/message.ts
import { Model, DataTypes, Optional, Association, HasManyGetAssociationsMixin } from 'sequelize';
import sequelize from '../config/database';
import ChatSession from './ChatSession';
import File, { IFile } from './File';

export interface IMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokenCount?: number;
  rawContent?: object | any[] | null;
  createdAt?: Date;
  files?: any[]; // Association with files
}

interface MessageCreation extends Optional<IMessage, 'id' | 'tokenCount' | 'rawContent'> { }

class Message
  extends Model<IMessage, MessageCreation>
  implements IMessage {
  public get id(): string { return this.getDataValue('id'); }
  public get sessionId(): string { return this.getDataValue('sessionId'); }
  public get role(): 'user' | 'assistant' | 'system' { return this.getDataValue('role'); }
  public get content(): string { return this.getDataValue('content'); }
  public get tokenCount(): number | undefined { return this.getDataValue('tokenCount'); }
  public get rawContent(): object | any[] | undefined | null { return this.getDataValue('rawContent'); }
  public get createdAt(): Date { return this.getDataValue('createdAt') as Date; }

  // Association methods
  public getFiles!: HasManyGetAssociationsMixin<any>;

  // Association declarations
  public readonly files?: any[];

  public static associations: {
    files: Association<Message, any>;
  };
}

Message.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    sessionId: { type: DataTypes.UUID, allowNull: false },
    role: { type: DataTypes.ENUM('user', 'assistant', 'system'), allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    tokenCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    rawContent: { type: DataTypes.JSONB, allowNull: true, field: 'raw_content' },
  },
  {
    underscored: true,
    sequelize,
    modelName: 'Message',
    tableName: 'messages',
    updatedAt: false,
  }
);

export default Message;