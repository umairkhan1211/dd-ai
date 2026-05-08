// src/pages/Subscription.tsx

import React, { useState, useMemo, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Check, CreditCard, Badge, Loader2, Clock } from "lucide-react"; // Import Loader2 for loading spinner
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Import the new subscription hook
import { useSubscription } from "@/hooks/use-subscription";
import { useNavigate, useSearchParams } from "react-router-dom";
// import { useBillingStatus } from "@/hooks/use-billing-status";

// --- Plan Definitions ---
// It's good practice to centralize plan data, mapping to your backend tiers
interface Plan {
  id: "trial" | "core" | "pro"; // Matches your backend tier enum
  name: string;
  description: string;
  price: string;
  features: string[];
  buttonText: string;
  buttonVariant: "default" | "outline";
  isPopular?: boolean;
  isContactSales?: boolean;
}

const plans: Plan[] = [
  {
    id: "trial",
    name: "Basic",
    description: "For casual users and getting started",
    price: "Free",
    features: [
      "3 Cast Members",
      "3 Protocols (Level 1)", // More specific based on restrictedProtocolLevels
      "100 Initial Ducks (One-time)", // Added from backend
      "Basic Operator Profile",
      "Core Functionality",
    ],
    buttonText: "Current Plan",
    buttonVariant: "outline",
  },
  {
    id: "core",
    name: "Core",
    price: "$14.99",
    description: "For advanced users and growing projects", // Updated description
    features: [
      "Unlimited Cast Members",
      "Unlimited Protocols ",
      "All Levels Unlocked",
      "1500 Monthly Ducks Quota",
      "40% rollover unused Ducks",
      "Task Tracking System",
      "Priority Support",
    ],
    buttonText: "Subscribe Now",
    buttonVariant: "default",
    isPopular: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$45",
    description: "For teams, enterprises, and heavy usage", // Updated description
    features: [
      "Unlimited Cast Members", // Matches backend Infinity
      "Unlimited Protocols (All Levels)", // Matches backend Infinity
      "10,000 Monthly Ducks Quota", // Added from backend
      "Everything in Core", // Still good to keep as a general statement
      "Team Collaboration",
      "Custom Cast Member API",
      "Dedicated Support Manager",
      "Advanced Analytics",
      "Custom Integration",
    ],
    buttonText: "Contact Sales",
    buttonVariant: "outline",
    isContactSales: true,
  },
];

// Animation variants for staggered animation
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// Feature check component
const FeatureCheck = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start gap-2 mt-2">
    <Check className="h-5 w-5 text-color shrink-0 mt-0.5" />
    <span>{children}</span>
  </div>
);

// Countdown Display (top section)
const CountdownDisplay = ({
  trialDaysLeft,
  currentPeriodEnd,
  totalDucks,
}: {
  trialDaysLeft: number | null;
  currentPeriodEnd: string | null;
  totalDucks: number;
}) => {

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!currentPeriodEnd) return;

    const endTime = new Date(currentPeriodEnd).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const distance = endTime - now;

      if (distance <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPeriodEnd]);

  if (!trialDaysLeft || trialDaysLeft <= 0) return null;

  return (
    <div className="flex flex-col items-center justify-center gap-3 bg-gradient-to-r from-amber-500/90 to-orange-500/90 text-white font-ubuntu text-sm sm:text-base px-4 sm:px-6 py-4 sm:py-5 rounded-2xl shadow-lg mb-10 w-[90%] sm:w-auto mx-auto text-center">

      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-center">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="font-medium">
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s left in trial
          </span>
        </div>
        <span className="hidden sm:inline">•</span>
        <span className="font-medium">{totalDucks} ducks remaining</span>
      </div>

      <div className="w-full sm:max-w-xl px-2 sm:px-0">
        <p className="text-center leading-relaxed">
          This trial allows you access to all premium features of{" "}
          <strong>Disruptive Duck AI</strong> for the next <strong>3 days</strong>. You can access all available AI models,
          create cast members, protocols, and multiple projects during this time frame.
        </p>
      </div>
    </div>
  );

};

const Subscription = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();


  const {
    useSubscriptionStatusQuery,
    useCreateCheckoutSession,
    useCancelSubscription,
    useBillingStatusQuery,
    usePaymentHistoryQuery,
    //  useCreateBillingPortalSession, Assuming you'll create this backend endpoint
  } = useSubscription();

  // Queries
  const {
    data: subscriptionStatus,
    isLoading,
    isError,
    error,
    refetch: refetchSubscriptionStatus,
  } = useSubscriptionStatusQuery();
  const { data: billingStatus, isLoading: isBillingLoading } =
    useBillingStatusQuery();
  const { data: paymentHistory, isLoading: isPaymentLoading } =
    usePaymentHistoryQuery();

  // Mutations
  const { mutate: createCheckoutSession, isPending: isCreatingSession } =
    useCreateCheckoutSession();
  const { mutate: cancelSubscription, isPending: isCanceling } =
    useCancelSubscription();

  const successUrl = `${window.location.origin}/dashboard/subscription?payment=success`;
  const cancelUrl = `${window.location.origin}/dashboard/subscription?payment=canceled`;



  // Handle subscribe button click
  const handleSubscribe = (planId: "trial" | "core" | "pro") => {
    if (planId === "trial") {
      // User is already on Free or wants to downgrade.
      // If allowing downgrade, you might need a different flow (e.g., direct status update, or manage via portal)
      toast({
        title: "Current Plan",
        description: "You are currently on the Basic (Free) plan.",
      });
      return;
    }

    if (planId === "pro") {
      // Pro plan often involves direct sales contact
      toast({
        title: "Contact Sales",
        description: "Please contact our sales team to discuss Pro options.",
      });
      // You might redirect to a contact form or display a modal here
      return;
    }

    // For paid plans (Core)
    // --- MODIFIED: Pass the 'tier' (planId) to the checkout session mutation ---
    createCheckoutSession({ tier: planId, successUrl, cancelUrl });
  };

  // Handle "Manage Subscription" click (for paid users)
  const handleManageSubscription = () => {
    toast({
      title: "Pro Subscription",
      description: "Comming soon.",
    });
  };

  const currentTier = subscriptionStatus?.tier;
  const isPaidUser = currentTier === "core" || currentTier === "pro";
  // Get trial days left and total ducks from billing status
  const trialDaysLeft = billingStatus?.trialDaysLeft;
  const totalDucksAvailable = billingStatus?.wallet?.totalDucksAvailable || 0;

  if (isLoading || isBillingLoading || isPaymentLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="ml-3 text-lg text-muted-foreground">
            Loading subscription plans...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="flex flex-col justify-center items-center h-96 text-center">
          <p className="text-red-500 text-lg">
            Failed to load subscription status.
          </p>
          <p className="text-muted-foreground">
            {error?.message || "Please try again later."}
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>

      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 "
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* --- Header --- */}
        <motion.div className="text-center mb-12" variants={item}>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-color font-ubuntu z-20 relative">
            Choose Your Plan
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto font-ubuntu text-sm md:text-base">
            Unlock the full potential of Deviation Engine with our premium plans
            designed for every workflow.
          </p>
        </motion.div>

        {/* --- Trial Expired Alert --- */}
        {billingStatus?.isTrialExpired && (
          <div className="bg-red-100 border border-red-300 text-red-800 p-4 rounded-lg mt-4 text-center max-w-xl mx-auto">
            <p className="font-semibold">Trial Expired</p>
            <p className="text-sm md:text-base">
              Your trial has ended. Please upgrade to continue.
            </p>
          </div>
        )}

        {/* --- Countdown Section (Top of Page) --- */}
        {!billingStatus ? (
          // Show loader until API response actually arrives
          <div className="flex items-center justify-center my-10">
            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin bg-gradient-to-r from-amber-400 to-orange-500"></div>
            <span className="ml-3 text-sm text-gray-600 font-ubuntu">
              Checking trial status...
            </span>
          </div>
        ) : billingStatus.isTrialExpired ? null : (
          // Show countdown once API data is loaded
          <CountdownDisplay
            trialDaysLeft={billingStatus.trialDaysLeft}
            currentPeriodEnd={billingStatus.subscription?.currentPeriodEnd}
            totalDucks={billingStatus.wallet?.totalDucksAvailable || 0}
          />

        )}


        {/* --- Plans Section --- */}
        <div className="flex flex-wrap justify-center gap-6 mt-8 w-full">
          {plans
            .filter((plan) => plan.id === "core")
            .map((plan) => {
              const isCurrentPlan = subscriptionStatus?.tier === "core";
              const isSubscribed = subscriptionStatus?.tier === "core";
              const trialDaysLeft = billingStatus?.trialDaysLeft ?? 0;
              const totalDucksAvailable =
                billingStatus?.wallet?.totalDucksAvailable || 0;

              return (
                <motion.div
                  key={plan.id}
                  variants={item}
                  className="relative w-full sm:w-[22rem] md:w-[24rem]"
                >


                  {/* --- Card --- */}
                  <Card
                    className={`relative h-full flex flex-col px-4 py-2 gap-2 ${isCurrentPlan
                      ? "glass-search-box glass-search-x border-2 shadow-lg"
                      : "glass-search-box glass-search-x"
                      }`}
                  >
                    {(
                      <div className="absolute -top-3 left-0 right-0 mx-auto w-fit px-3 py-1 bg-green-500 rounded-full text-white text-xs font-medium font-ubuntu">
                        CURRENT PLAN
                      </div>
                    )}

                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-color" />
                        <span className="text-base md:text-lg">{plan.name}</span>
                      </CardTitle>
                      <CardDescription className="text-sm md:text-base">
                        {plan.description}
                      </CardDescription>
                      <div className="mt-4">
                        <span className="text-3xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground ml-1 text-sm">
                          /month
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-grow">
                      <div className="space-y-2 text-sm">
                        {plan.features.map((feature, idx) => (
                          <FeatureCheck key={idx}>{feature}</FeatureCheck>
                        ))}
                      </div>
                    </CardContent>

                    <CardFooter>
                      <Button
                        onClick={() => handleSubscribe(plan.id)}
                        className="w-full glass-search hover:bg-transparent"
                        disabled={isCreatingSession || isSubscribed}
                      >
                        {isCreatingSession ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CreditCard className="mr-2 h-4 w-4" />
                        )}
                        {isSubscribed ? "Current Plan" : "Subscribe Now"}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
        </div>

        {/* --- All Plans Include --- */}
        <motion.div variants={item} className="mt-12 text-center">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-color font-ubuntu">
            All Plans Include
          </h2>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 mt-4 max-w-3xl mx-auto">
            {[
              "Regular Updates",
              "Browser Support",
              "Cognitive Framework",
              "Basic Support",
              "Community Access",
            ].map((feature, i) => (
              <div
                key={i}
                className="glass-tabs text-accent-foreground px-4 py-2 rounded-full text-xs md:text-sm font-medium"
              >
                {feature}
              </div>
            ))}
          </div>
        </motion.div>

        {/* --- Billing Info + History + Subscription --- */}
        <div className="relative glass-search-c p-4 sm:p-6 mt-10 rounded-xl overflow-hidden">
          {/* Background Circles */}
          <div className="circle-green circle-1-green"></div>
          <div className="circle-green circle-2-green"></div>

          {/* --- Billing Info --- */}
          {billingStatus && (
            <div className="z-10 relative w-full max-w-4xl mx-auto p-2">
              <h3 className="text-2xl font-semibold mb-4 font-ubuntu">
                Billing Info
              </h3>
              <div className="text-sm md:text-base space-y-1 font-ubuntu">
                <p>Status: {billingStatus.subscription?.status}</p>
                <p>Tier: {billingStatus.subscription?.tier}</p>
                <p>
                  Expiry:{" "}
                  {billingStatus.subscription?.currentPeriodEnd
                    ? new Date(
                      billingStatus.subscription.currentPeriodEnd
                    ).toLocaleString()
                    : "Not available"}
                </p>
                {billingStatus.subscription?.trialEndDate && (
                  <p>
                    Trial ends:{" "}
                    {new Date(
                      billingStatus.subscription.trialEndDate
                    ).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* --- Payment History --- */}
          {paymentHistory?.data?.length > 0 && (
            <div className="mt-6 z-10 relative w-full max-w-4xl mx-auto p-2">
              <h3 className="text-lg md:text-xl font-semibold mb-4 font-ubuntu">
                Payment History
              </h3>
              <div className="space-y-4">
                {paymentHistory.data.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-2 gap-2"
                  >
                    <div>
                      <p className="font-medium font-ubuntu">
                        {payment.description}
                      </p>
                      <p className="text-sm text-muted-foreground font-ubuntu">
                        {new Date(payment.created).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p>
                        {payment.amount} {payment.currency}
                      </p>
                      <p
                        className={`text-sm font-ubuntu ${payment.status === "succeeded" ||
                          payment.status === "paid"
                          ? "text-green-500"
                          : "text-red-500"
                          }`}
                      >
                        {payment.status}
                      </p>
                      {payment.invoiceUrl && (
                        <a
                          href={payment.invoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline text-sm font-ubuntu"
                        >
                          View Invoice
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- Current Subscription --- */}
          {subscriptionStatus?.status === "active" && (
            <div className="mt-10 w-full max-w-4xl mx-auto p-2 z-10 relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-lg font-semibold font-ubuntu">
                  Current Subscription
                </h3>
                <p className="text-muted-foreground text-sm">
                  {subscriptionStatus.tier}
                </p>
              </div>
              <Button
                onClick={() =>
                  cancelSubscription({
                    subscriptionId: subscriptionStatus.stripeSubscriptionId!,
                  })
                }
                disabled={isCanceling}
                variant="destructive"
                className="w-full sm:w-auto"
              >
                {isCanceling ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Cancel Subscription"
                )}
              </Button>
            </div>
          )}
        </div>
      </motion.div>

    </DashboardLayout>

  );
};

export default Subscription;

