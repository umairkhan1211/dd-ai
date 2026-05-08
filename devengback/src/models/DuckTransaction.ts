import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface IDuckTransaction {
  id: string;
  userId: string;
  type: 'allocation' | 'deduction' | 'bonus' | 'grant' | 'rollover' | 'adjustment'; // Type of transaction
  amount: string; // Amount of Ducks transacted
  balanceAfter: string; // User's Duck balance after this transaction
  description?: string; // Human-readable description
  details?: object; // Optional JSON field for additional context (e.g., { action: 'AI_CHAT_MEDIUM' })
  createdAt?: Date;
  updatedAt?: Date;
}

interface DuckTransactionCreationAttributes
  extends Optional<
    IDuckTransaction,
    'id' | 'description' | 'details' | 'createdAt' | 'updatedAt'
  > {}

class DuckTransaction
  extends Model<IDuckTransaction, DuckTransactionCreationAttributes>
  implements IDuckTransaction
{
  declare id: string;
  declare userId: string;
  declare type: 'allocation' | 'deduction' | 'bonus' | 'grant' | 'rollover' | 'adjustment';
  declare amount: string;
  declare balanceAfter: string;
  declare description?: string;
  declare details?: object;
  declare createdAt: Date;
  declare updatedAt: Date;
}

DuckTransaction.init(
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
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE', // If user is deleted, keep or delete their transactions based on your policy. CASCADE for now.
    },
    type: {
      type: DataTypes.ENUM('allocation', 'deduction', 'bonus', 'grant', 'rollover', 'adjustment'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT, // Use FLOAT for fractional Duck amounts
      allowNull: false,
    },
    balanceAfter: {
      type: DataTypes.FLOAT, // Use FLOAT for fractional Duck amounts
      allowNull: false,
      field: 'balance_after',
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    details: {
      type: DataTypes.JSONB, // Use JSONB for PostgreSQL for efficient storage of JSON data
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'DuckTransaction', // Make sure this matches the modelName if you use it in associations
    tableName: 'duck_transactions', // Make sure this matches the tableName if you use it in associations
    underscored: true,
    timestamps: true,
  }
);

export default DuckTransaction;
