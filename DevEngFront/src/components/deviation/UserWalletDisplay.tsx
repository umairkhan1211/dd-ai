// src/components/UserWalletDisplay.tsx

import React from "react";
import { useUserWallet } from "@/hooks/use-wallet"; // Adjust path if needed
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator"; // Assuming you have a Separator component
import { Loader2, Coins, Feather, Bot, Users, BookOpen, MessageSquare } from "lucide-react"; // Icons
import { useAiModels } from "@/services/aiModelService";
import { motion } from "framer-motion";
import { useSubscription } from "@/hooks/use-subscription";

export const UserWalletDisplay = ({ item }) => {

  const { data: wallet, isLoading: isWalletLoading, isError, error } = useUserWallet();
  const { data: aiModelsResponse, isLoading: isModelsLoading } = useAiModels();

  const {
    useSubscriptionStatusQuery,
  } = useSubscription();

  const {
    data: subscriptionStatus,
  } = useSubscriptionStatusQuery();

  const isTrial = subscriptionStatus?.tier === "trial";

  if (isWalletLoading || isModelsLoading) {
    return (
      <Card className="w-full ">
        <CardContent className="p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading wallet data...</p>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center text-red-500">
          <p>Error loading wallet: {error?.message || "Unknown error"}</p>
        </CardContent>
      </Card>
    );
  }

  if (!wallet) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>No wallet data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto shadow-lg glass-tabs ">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Coins className="h-6 w-6 text-yellow-500" />
            <span className="font-ubuntu">
              Your Deviation Engine Wallet

            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          {/* Ducks Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 glass-search-x">
              <div className="flex items-center gap-3">
                <Feather className="h-6 w-6 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Ducks Available
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {wallet.aiUsage.totalDucksAvailable}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 glass-search-x">
              <div className="flex items-center gap-3">
                <Coins className="h-6 w-6 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Quota</p>
                  <p className="text-2xl font-bold text-white">
                    {wallet.aiUsage.monthlyDuckQuota}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 glass-search-x">
              <div className="flex items-center gap-3">
                <Bot className="h-6 w-6 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Ducks Consumed This Month
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {wallet.aiUsage.ducksConsumedThisMonth.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 glass-search-x">
              <div className="flex items-center gap-3">
                <Bot className="h-6 w-6 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Ducks Consumed Today
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {wallet.aiUsage.ducksConsumedToday.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Content Limits */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-600" />
              Content Creation Limits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Cast Members */}
              <div className="p-4 glass-search-x">
                <p className="text-sm text-muted-foreground">Cast Members</p>

                <p className="text-xl font-bold">
                  {isTrial
                    ? `${wallet.templates.cast.count} / ${wallet.templates.cast.limit}`
                    : "Unlimited"}
                </p>
              </div>

              {/* Protocols */}
              <div className="p-4 glass-search-x">
                <p className="text-sm text-muted-foreground">Protocols</p>

                <p className="text-xl font-bold">
                  {isTrial
                    ? `${wallet.templates.protocol.count} / ${wallet.templates.protocol.limit}`
                    : "Unlimited"}
                </p>
              </div>

            </div>

          </div>

          <Separator />

          {/* Available AI Models */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              Available AI Models
            </h3>
            <div className="flex flex-wrap gap-2">
              {aiModelsResponse?.data.map((model, index) => (
                <span
                  key={index}
                  className="px-3 py-1 glass-tabs text-sm"
                >
                  {model.displayName}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suggestion / feedback note */}
      <motion.div
        variants={item}
        className="mt-10 mb-10 flex flex-col md:flex-row items-center justify-center gap-2 text-sm text-muted-foreground text-center font-ubuntu"
      >
        <MessageSquare className="h-4 w-4 text-primary" />
        <p className="text-sm">
          Leave your feedback or suggestions on{" "}
          <a
            href="https://discord.com/invite/NJb7WVCj"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary transition-colors"
          >
            Discord
          </a>{" "}
          or via{" "}
          <a
            href="mailto:info.disruptiveduck@gmail.com"
            className="underline hover:text-primary transition-colors"
          >
            Email
          </a>
          .
        </p>
      </motion.div>



    </>
  );
};
