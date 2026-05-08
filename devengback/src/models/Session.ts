import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface ISession {
  sid: string;
  sess: any; // JSON object for session data
  expire: Date;
}

interface SessionCreationAttributes extends Optional<ISession, 'sid' | 'expire'> {}

class Session extends Model<ISession, SessionCreationAttributes> implements ISession {
  declare sid: string;
  declare sess: any;
  declare expire: Date;
}

Session.init(
  {
    sid: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    sess: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    expire: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Session',
    tableName: 'session',
    timestamps: false, // No createdAt/updatedAt
  }
);

export default Session;
