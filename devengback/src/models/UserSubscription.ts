import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface IUserSubscription {
  id: string; // Your internal UUID for this subscription record
  userId: string; // Foreign key to the User model

  stripeCustomerId?: string; // Stripe's Customer ID (optional for trial users)
  stripeSubscriptionId?: string; // Stripe's Subscription ID (optional for trial users)
  stripePriceId?: string; // Stripe's Price ID for the subscribed product (optional for trial users)

  // Status enum values: These describe the state of a *paid* subscription.
  // 'trial' is not included here as the 'tier' field defines the plan level.
  status?:
    | 'trialing'
    | 'active'
    | 'inactive'
    | 'incomplete'
    | 'incomplete_expired'
    | 'past_due'
    | 'canceled'
    | 'unpaid'
    | 'paused'
    | null;

  // Tier: This explicitly includes 'trial', 'core', and 'pro' as per your plan.
  tier: 'trial' | 'core' | 'pro';

  currentPeriodStart?: Date; // Start date of the current billing period (optional for trial users)
  currentPeriodEnd?: Date; // End date of the current billing period (optional for trial users)
  cancelAtPeriodEnd: boolean; // True if the subscription is set to cancel at the end of the current period

  createdAt?: Date;
  updatedAt?: Date;
}

interface UserSubscriptionCreationAttributes
  extends Optional<
    IUserSubscription,
    | 'id'
    | 'createdAt'
    | 'updatedAt'
    | 'stripeCustomerId'
    | 'stripeSubscriptionId'
    | 'stripePriceId'
    | 'status'
    | 'currentPeriodStart'
    | 'currentPeriodEnd'
  > {}

class UserSubscription
  extends Model<IUserSubscription, UserSubscriptionCreationAttributes>
  implements IUserSubscription
{
  declare id: string;
  declare userId: string;
  declare stripeCustomerId?: string;
  declare stripeSubscriptionId?: string;
  declare stripePriceId?: string;
  declare status?:
    | 'trialing'
    | 'active'
    | 'inactive'
    | 'incomplete'
    | 'incomplete_expired'
    | 'past_due'
    | 'canceled'
    | 'unpaid'
    | 'paused'
    | null;
  declare tier: 'trial' | 'core' | 'pro';
  declare currentPeriodStart?: Date;
  declare currentPeriodEnd?: Date;
  declare cancelAtPeriodEnd: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

UserSubscription.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true, // Ensures one-to-one relationship (one subscription record per user)
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE', // If user is deleted, delete their subscription record
      field: 'user_id',
    },
    stripeCustomerId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'stripe_customer_id',
    },
    stripeSubscriptionId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      field: 'stripe_subscription_id',
    },
    stripePriceId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'stripe_price_id',
    },
    status: {
      type: DataTypes.ENUM(
        'active',
        'inactive', // Consider if 'inactive' is needed, or if other statuses cover it
        'trialing',
        'past_due',
        'canceled',
        'unpaid',
        'paused',
        'incomplete',
        'incomplete_expired'
      ),
      allowNull: true,
    },
    tier: {
      type: DataTypes.ENUM('trial', 'core', 'pro'),
      defaultValue: 'trial',
      allowNull: false,
    },
    currentPeriodStart: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'current_period_start',
    },
    currentPeriodEnd: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'current_period_end',
    },
    cancelAtPeriodEnd: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'cancel_at_period_end',
    },
  },
  {
    sequelize,
    modelName: 'UserSubscription',
    tableName: 'user_subscriptions',
    timestamps: true,
    underscored: true,
  }
);

export default UserSubscription;
