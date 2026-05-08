// src/hooks/use-wallet.ts

import { useApiQuery } from "./use-api"; // Import your generic API query hook

// Define the expected structure of the data returned from the backend
interface UserWalletData {
  templates: {
    cast: { count: number; limit: number; unlimited: boolean };
    protocol: { count: number; limit: number; unlimited: boolean };
  };
  aiUsage: {
    totalDucksAvailable: number;
    monthlyDuckQuota: number;
    dailyDuckBonusRemaining: number;
    ducksConsumedThisMonth: number;
    ducksConsumedToday: number;
    unlimitedDucks: boolean;
  };
  availableModels: string[];
  // If you also want to show transactions, define the type here:
  // transactions: Array<{
  //   id: string;
  //   amount: number;
  //   description: string;
  //   type: string; // e.g., 'earning', 'consumption'
  //   createdAt: string; // Date string
  // }>;
}

export const useUserWallet = () => {
  // Use your generic useApiQuery hook
  // queryKey: ['userWallet'] is a good specific key for this data
  // url: '/wallet' is the endpoint your backend exposes (assuming /api/wallet route setup)
  return useApiQuery<UserWalletData>(["userWallet"], "/wallet", {
    // Optional: You can add specific React Query options here, e.g., staleTime, cacheTime
    // staleTime: 1000 * 60 * 5, // Data is considered fresh for 5 minutes
    // cacheTime: 1000 * 60 * 10, // Data stays in cache for 10 minutes after inactive
  });
};
