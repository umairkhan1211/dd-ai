import { OperatorType } from "@/services/operatorService";

export interface UserType {
  id: string;
  email: string;
  name?: string;
  // Add other user fields as necessary from your backend's IUser interface
  googleId?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  image?: string;
  stripeCustomerId?: string;
  subscriptionId?: string;
  subscriptionStatus?: 'free' | 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
  subscriptionTier?: 'free' | 'premium';
  subscriptionEndsAt?: Date;
  activeOperator?: string; // This would be the ID
  activeOperatorDetail?: OperatorType; // This would be the populated operator object
  createdAt?: Date;
  updatedAt?: Date;
} 