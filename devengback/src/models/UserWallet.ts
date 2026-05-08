import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface IUserWallet {
  id: string;
  userId: string;

  // Duck Currency Management
  totalDucksAvailable: string;
  monthlyDuckQuota: string;
  dailyDuckBonusRemaining: string;
  lastDailyBonusReset?: Date;
  rolloverDucks: string;
  lastMonthlyReset?: Date;

  // Content Specific Limits (from your plan)
  castMembersCount: number;
  protocolsCount: number;

  // For price transition (Core Plan)
  oneTimeDuckGrantGiven: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

interface UserWalletCreationAttributes
  extends Optional<
    IUserWallet,
    | 'id'
    | 'createdAt'
    | 'updatedAt'
    | 'totalDucksAvailable'
    | 'monthlyDuckQuota'
    | 'dailyDuckBonusRemaining'
    | 'lastDailyBonusReset'
    | 'rolloverDucks'
    | 'lastMonthlyReset'
    | 'castMembersCount'
    | 'protocolsCount'
    | 'oneTimeDuckGrantGiven'
  > {}

class UserWallet extends Model<IUserWallet, UserWalletCreationAttributes> implements IUserWallet {
  declare id: string;
  declare userId: string;
  declare totalDucksAvailable: string;
  declare monthlyDuckQuota: string;
  declare dailyDuckBonusRemaining: string;
  declare lastDailyBonusReset?: Date;
  declare rolloverDucks: string;
  declare lastMonthlyReset?: Date;
  declare castMembersCount: number;
  declare protocolsCount: number;
  declare oneTimeDuckGrantGiven: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

UserWallet.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      field: 'user_id',
    },
    totalDucksAvailable: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: false,
      field: 'total_ducks_available',
    },
    monthlyDuckQuota: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: false,
      field: 'monthly_duck_quota',
    },
    dailyDuckBonusRemaining: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: false,
      field: 'daily_duck_bonus_remaining',
    },
    lastDailyBonusReset: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_daily_bonus_reset',
    },
    rolloverDucks: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: false,
      field: 'rollover_ducks',
    },
    lastMonthlyReset: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_monthly_reset',
    },
    castMembersCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      field: 'cast_members_count',
    },
    protocolsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      field: 'protocols_count',
    },
    oneTimeDuckGrantGiven: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'one_time_duck_grant_given',
    },
  },
  {
    sequelize,
    modelName: 'UserWallet',
    tableName: 'user_wallets',
    timestamps: true,
    underscored: true,
  }
);

export default UserWallet;
