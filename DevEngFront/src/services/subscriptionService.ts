// src/services/subscriptionService.ts

import apiClient from "@/lib/api";
import { secureStorage } from "@/lib/secureStorage";

// Type definitions for requests and responses
export interface CreateCheckoutSessionPayload {
  tier: "core" | "pro";
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

// 1. Get Billing Status
export type GetBillingStatusPayload = {
  userId: string; // id of the user whose billing status we need
};

interface BillingStatusResponse {
  currentTier: "trial" | "core" | "pro";
  isOutOfDucks: boolean;
  isTrialExpired: boolean;
  shouldShowUpgradePrompt: boolean;
  trialDaysLeft: number | null;
  subscription: {
    status: string;
    tier: string;
    currentPeriodEnd: string;
    trialEndDate?: string;
  };
  wallet: {
    totalDucksAvailable: number;
    monthlyDuckQuota: number;
    dailyDuckBonusRemaining: number;
    rolloverDucks: number;
    lastDailyReset: string;
    lastMonthlyReset: string;
  };
}


// 2. Get Payment History
export type GetPaymentHistoryPayload = {
  userId: string;
  limit?: number; // optional, number of records to fetch
  offset?: number; // optional, for pagination
};

export type PaymentHistoryResponse = {
  payments: {
    id: string;
    date: string; // ISO date string
    amount: number;
    currency: string;
    status: "paid" | "failed" | "refunded";
    method: string; // e.g., "card", "paypal"
  }[];
  total: number; // total number of records available
};


export interface SubscriptionStatusResponse {
  status:
  | "trialing"
  | "active"
  | "incomplete"
  | "incomplete_expired"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "paused"
  | "trial"
  | null;
  tier: "trial" | "core" | "pro";
  currentPeriodEnd?: Date;
  stripeSubscriptionId?: string;
  // Potentially add more fields if needed from the backend's getSubscriptionStatus response
}

export interface CancelSubscriptionPayload {
  subscriptionId: string; // Stripe Subscription ID
}

// API endpoint prefix for subscriptions
const SUBSCRIPTION_ENDPOINT = "/subscriptions";

// Subscription service functions
export const subscriptionService = {
  /**
   * Fetches the current user's subscription status from the backend.
   */
  getSubscriptionStatus: async (): Promise<SubscriptionStatusResponse> => {
    const response = await apiClient.get(`${SUBSCRIPTION_ENDPOINT}/status`);
    // Ensure currentPeriodEnd is correctly parsed as a Date object if it exists
    if (response.data.currentPeriodEnd) {
      response.data.currentPeriodEnd = new Date(response.data.currentPeriodEnd);
    }

    // set Encrypted User Type
    const existingUserType = secureStorage.getItem("user_type");
    const newUserType = response.data.tier;
    if (existingUserType !== newUserType) {
      secureStorage.setItem("user_type", newUserType);
    }

    return response.data;
  },

  /**
   * Initiates a Stripe Checkout Session for a new subscription.
   */
  createCheckoutSession: async (
    payload: CreateCheckoutSessionPayload
  ): Promise<CreateCheckoutSessionResponse> => {
    const response = await apiClient.post(
      `${SUBSCRIPTION_ENDPOINT}/create-checkout-session`,
      payload
    );
    return response.data;
  },

  /**
   * Requests to cancel the user's Stripe subscription via the backend.
   */
  cancelSubscription: async (
    payload: CancelSubscriptionPayload
  ): Promise<void> => {
    await apiClient.post(`${SUBSCRIPTION_ENDPOINT}/cancel`, payload);
  },

  // You might add more functions here if your backend exposes them,
  // e.g., to get a specific subscription, or manage billing portal access.

  // Add inside subscriptionService object


  // Get Billing Status

  getBillingStatus: async (): Promise<BillingStatusResponse> => {
    const response = await apiClient.get("/billing/status"); // GET
    return response.data;
  },

  // Get Payment History
  getPaymentHistory: async (limit: number, offset: number) => {
    const { data } = await apiClient.get(`/subscriptions/payment-history?limit=${limit}&offset=${offset}`);
    // 👇 Yahan ensure karo ke API array return kar rahi hai
    return data?.payments || data;
  },

};
