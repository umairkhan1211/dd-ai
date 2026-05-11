import axios from "axios";
import { toast } from "@/hooks/use-toast";

const apiClient = axios.create({
  // baseURL: import.meta.env.VITE_API_URL || "/api",
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response, config } = error;

    if (response) {
      const backendErrorMessage = response.data?.message;

      if (response.status === 402 && response.data?.action === "SUBSCRIBE") {
        console.warn("[Billing Interceptor] Subscription block:", response.data.error);

        // Save billing status for later use in React
        // localStorage.setItem(
        //   "billingStatus",
        //   JSON.stringify(response.data.billingStatus)
        // );

        // Show message
        toast({
          title: "Subscription Required",
          description: response.data.message, // ← comes from your backend
          variant: "destructive",
        });

        // Redirect to subscription page
        if (window.location.pathname !== "/dashboard/subscription") {
          window.location.href = "/dashboard/subscription";
        }

        return Promise.reject(error);
      }

      if (
        (config.url === "/user/me" || config.url === "/auth/signout") &&
        response.status === 401
      ) {
        return Promise.reject(error);
      }

      // Extract the error message from the response data if available
      // This is the key change: use response.data?.message

      switch (response.status) {
        case 401: {
          toast({
            title: "Session Expired",
            description:
              backendErrorMessage ||
              "Your session has expired. Please log in again.",
            variant: "destructive",
          });
          if (config.url !== "/auth/signin") {
            window.location.href = "/signin";
          }
          break;
        }

        case 403: {
          toast({
            title: "Access Denied",
            // FIX: Use the backendErrorMessage here
            description:
              backendErrorMessage ||
              "You don't have permission to perform this action.",
            variant: "destructive",
          });
          break;
        }

        case 404: {
          if (backendErrorMessage != "User record not found") {
            toast({
              title: "Not Found",
              // FIX: Use the backendErrorMessage here
              description:
                backendErrorMessage ||
                "The requested resource could not be found.",
              variant: "destructive",
            });
            break;
          }
        }

        case 409: {
          // Add case for 409 Conflict
          if (backendErrorMessage != "User record not found") {
            toast({
              title: "Conflict",
              description:
                backendErrorMessage ||
                "A conflict occurred with the existing resource.",
              variant: "destructive",
            });
            break;
          }
        }

        case 500:
        case 502:
        case 503:
        case 504: {
          if (backendErrorMessage != "User record not found") {
            const errorMessage =
              backendErrorMessage || "Something went wrong. Please try again.";
            toast({
              title: "Server Error",
              description: errorMessage,
              variant: "destructive",
            });
            break;
          }
        }

        default: {
          if (backendErrorMessage != "User record not found") {
            const errorMessage =
              backendErrorMessage || "Something went wrong. Please try again.";

            toast({
              title: "Error",
              description: errorMessage,
              variant: "destructive",
            });
            break;
          }
        }
      }
    } else {
      toast({
        title: "Network Error",
        description:
          "Unable to connect to server. Please check your internet connection.",
        variant: "destructive",
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient;
