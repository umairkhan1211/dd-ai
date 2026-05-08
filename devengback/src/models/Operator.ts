import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface IOperator {
  id: string;
  userId: string;
  label: string;
  profile: object;
  createdAt?: Date;
  updatedAt?: Date;
}

interface OperatorCreation
  extends Optional<IOperator, 'id'> {}

class Operator
  extends Model<IOperator, OperatorCreation>
  implements IOperator
{
  declare id: string;
  declare userId: string;
  declare label: string;
  declare profile: object;
}

Operator.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: { type: DataTypes.UUID, allowNull: false },
    label: { type: DataTypes.STRING, allowNull: false },
    profile: { type: DataTypes.JSONB, allowNull: false },
  },
  {
    underscored: true,
    sequelize,
    modelName: 'Operator',
    tableName: 'operators',
  }
);

export default Operator;
