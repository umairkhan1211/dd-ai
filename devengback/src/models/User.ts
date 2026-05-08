import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database'; // Assuming this path is correct for your Sequelize instance
import { IUserSubscription } from './UserSubscription';
import { IUserWallet } from './UserWallet';

export interface IUser {
  id: string;
  googleId?: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password?: string;
  image?: string;
  isFirstLogin?: boolean;
  activeOperator?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isVerified?: boolean;
  verificationToken?: string | null;
  role: 'user' | 'admin';
  subscription?: IUserSubscription; // Add this line
  wallet?: IUserWallet;
}

interface UserCreationAttributes
  extends Optional<IUser, 'id' | 'createdAt' | 'updatedAt' | 'activeOperator'> {}

class User extends Model<IUser, UserCreationAttributes> implements IUser {
  declare id: string;
  declare googleId?: string;
  declare displayName: string;
  declare firstName?: string;
  declare lastName?: string;
  declare email: string;
  declare password?: string;
  declare image?: string;
  declare isFirstLogin?: boolean;
  declare activeOperator?: string;
  declare isVerified?: boolean;
  declare verificationToken?: string | null;
  declare role: 'user' | 'admin';
  declare createdAt: Date;
  declare updatedAt: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isFirstLogin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_first_login',
    },

    activeOperator: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'active_operator',
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_verified',
    },
    verificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'verification_token',
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user',
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    underscored: true,
  }
);

export default User;
