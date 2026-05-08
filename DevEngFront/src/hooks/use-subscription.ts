import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  subscriptionService,
  CreateCheckoutSessionPayload,
  CreateCheckoutSessionResponse,
  SubscriptionStatusResponse,
  CancelSubscriptionPayload,
} from "@/services/subscriptionService";
import { useToast } from "@/hooks/use-toast";

// Query keys for subscription data
export const subscriptionKeys = {
  all: ["subscription"] as const,
  status: () => [...subscriptionKeys.all, "status"] as const,
};

export const useSubscription = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  /**
   * Query to fetch the current user's subscription status.
   */
  const useSubscriptionStatusQuery = () => {
    return useQuery<SubscriptionStatusResponse, Error>({
      queryKey: subscriptionKeys.status(),
      queryFn: subscriptionService.getSubscriptionStatus,
      // Optional: Add refetchOnWindowFocus: false if you only want to refetch
      // when explicitly triggered or on mount, to avoid excessive API calls.
      refetchOnWindowFocus: false,
    });
  };

  /**
   * Mutation to create a Stripe Checkout Session.
   * On success, it will redirect the user to the Stripe checkout URL.
   */
  const useCreateCheckoutSession = () => {
    return useMutation<
      CreateCheckoutSessionResponse,
      Error,
      CreateCheckoutSessionPayload
    >({
      mutationFn: subscriptionService.createCheckoutSession,
      onSuccess: (data) => {
        // Invalidate the subscription status query so it refetches after checkout
        // (though the webhook will ultimately update the real status)
        queryClient.invalidateQueries({ queryKey: subscriptionKeys.status() });

        // Redirect to Stripe Checkout
        if (data.url) {
          window.location.href = data.url;
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to get Stripe checkout URL.",
          });
        }
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Payment Error",
          description: `Failed to create checkout session: ${error.message || "Please try again."
            }`,
        });
      },
      onMutate: () => {
        toast({
          title: "Redirecting...",
          description: "Please wait while we prepare your checkout session.",
        });
      },
    });
  };

  /**
   * Mutation to cancel a user's subscription.
   * This typically relies on the webhook to update the database status.
   */
  const useCancelSubscription = () => {
    return useMutation<void, Error, CancelSubscriptionPayload>({
      mutationFn: subscriptionService.cancelSubscription,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: subscriptionKeys.status() });
        toast({
          title: "Subscription Canceled",
          description:
            "Your subscription cancellation request has been processed.",
        });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Cancellation Error",
          description: `Failed to cancel subscription: ${error.message || "Please try again."
            }`,
        });
      },
    });
  };

  const useBillingStatusQuery = () => {
    return useQuery({
      queryKey: [...subscriptionKeys.all, "billing-status"],
      queryFn: subscriptionService.getBillingStatus,
      refetchOnWindowFocus: false,
    });
  };

  const usePaymentHistoryQuery = (limit = 10, offset = 0) => {
    return useQuery({
      queryKey: [...subscriptionKeys.all, "payment-history", limit, offset],
      queryFn: () => subscriptionService.getPaymentHistory(limit, offset),
      refetchOnWindowFocus: false,
    });
  };

  return {
    useSubscriptionStatusQuery,
    useCreateCheckoutSession,
    useCancelSubscription,
    useBillingStatusQuery,
    usePaymentHistoryQuery,
  };
};
