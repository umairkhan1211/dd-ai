import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface IUserSession {
  id: string;
  userId: string;
  sessionId: string;
  startedAt: Date;
  lastActivity: Date;
  ipAddress: string;
  userAgent: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserSessionCreationAttributes
  extends Optional<IUserSession, 'id' | 'createdAt' | 'updatedAt'> {}

class UserSession
  extends Model<IUserSession, UserSessionCreationAttributes>
  implements IUserSession
{
  declare id: string;
  declare userId: string;
  declare sessionId: string;
  declare startedAt: Date;
  declare lastActivity: Date;
  declare ipAddress: string;
  declare userAgent: string;
  declare active: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

UserSession.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    lastActivity: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userAgent: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'UserSession',
    tableName: 'user_sessions',
    underscored: true,
  }
);

export default UserSession;
