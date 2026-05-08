import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface IStripeEvent {
  id: string; // Your internal UUID for the event
  stripeId: string; // Stripe's event ID (e.g., 'evt_xxxxxxxxxxxx')
  eventType: string; // Type of Stripe event (e.g., 'customer.subscription.updated')
  data: object; // Full event data from Stripe
  apiVersion: string; // Stripe API version used for the event
  isProcessed: boolean; // Flag to indicate if the event has been successfully processed
  processedAt?: Date; // Timestamp when the event was processed
  error?: string; // Any error message if processing failed
  createdAt?: Date;
  updatedAt?: Date;
}

interface StripeEventCreationAttributes
  extends Optional<
    IStripeEvent,
    'id' | 'isProcessed' | 'processedAt' | 'error' | 'createdAt' | 'updatedAt'
  > {}

class StripeEvent
  extends Model<IStripeEvent, StripeEventCreationAttributes>
  implements IStripeEvent
{
  declare id: string;
  declare stripeId: string;
  declare eventType: string;
  declare data: object;
  declare apiVersion: string;
  declare isProcessed: boolean;
  declare processedAt?: Date;
  declare error?: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

StripeEvent.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    stripeId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Ensure no duplicate Stripe events are stored
      field: 'stripe_id',
    },
    eventType: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'event_type',
    },
    data: {
      type: DataTypes.JSONB, // Use JSONB for PostgreSQL for efficient storage of JSON data
      allowNull: false,
    },
    apiVersion: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'api_version',
    },
    isProcessed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'is_processed',
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'processed_at',
    },
    error: {
      type: DataTypes.TEXT, // Use TEXT for potentially long error messages
      allowNull: true,
    },
  },
  {
    sequelize, // Correctly passed the imported sequelize instance
    modelName: 'StripeEvent',
    tableName: 'stripe_events',
    underscored: true,
    timestamps: true,
  }
);

export default StripeEvent;
