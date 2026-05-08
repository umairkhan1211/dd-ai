import { useApiMutation } from "./use-api";
import { useToast } from "./use-toast";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import authService from "@/services/authService";
import { useQuery } from "@tanstack/react-query";

// Types for authentication payloads
export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    isFirstLogin?: boolean;
  };
}

// Error response interface
interface ErrorResponse {
  message: string;
  statusCode?: number;
}

export const useAuth = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Sign in mutation hook
  // const useSignIn = () => {
  //   return useApiMutation<AuthResponse, SignInPayload>("/auth/signin", {
  //     mutationFn: authService.signIn,
  //     onSuccess: (data) => {
  //       toast({
  //         title: "Sign in successful",
  //         description: "You have been signed in successfully.",
  //       });
  //       navigate("/dashboard", { state: { user: data.user } });
  //     },
  //     onError: (error: AxiosError) => {
  //       const errorMessage =
  //         error.response?.data && typeof error.response.data === "object"
  //           ? (error.response.data as ErrorResponse).message
  //           : "Invalid email or password. Please try again.";

  //       toast({
  //         title: "Sign in failed",
  //         description: errorMessage,
  //         variant: "destructive",
  //       });
  //     },
  //   });
  // };


  const useSignIn = () => {
    return useApiMutation<AuthResponse, SignInPayload>("/auth/signin", {
      mutationFn: authService.signIn,
    });
  };

  // Sign up mutation hook
  const useSignUp = () => {
    return useApiMutation<AuthResponse, SignUpPayload>("/auth/signup", {
      mutationFn: authService.signUp,
      onSuccess: (data) => {
        toast({
          title: "Account created successfully",
          description: "Please verify your email to continue.",
        });
        // navigate("/dashboard", { state: { user: data.user } });
      },
      onError: (error: AxiosError) => {
        const errorMessage =
          error.response?.data && typeof error.response.data === "object"
            ? (error.response.data as ErrorResponse).message
            : "Could not create account. Please try again.";

        toast({
          title: "Sign up failed",
          description: errorMessage,
          variant: "destructive",
        });
      },
    });
  };

  // Sign out function
  const useSignOut = () => {
    return useApiMutation<void, void>("/auth/logout", {
      mutationFn: authService.signOut,
      onSuccess: () => {
        // Update toast
        toast({
          title: "Sign out successful",
          description: "You have been signed out successfully.",
        });

        localStorage.removeItem("billingStatus");

        // Redirect to home
        navigate("/");
      },
    });
  };

  // Use Google OAuth
  const useGoogleSignIn = () => {
    return {
      mutate: () => {
        authService.googleSignIn().catch((error) => {
          toast({
            title: "Google Sign-In Failed",
            description: "Could not initiate Google sign-in. Please try again.",
            variant: "destructive",
          });
        });
      },
    };
  };

  // Check if user is authenticated using React Query
  const useAuthStatus = () => {
    return useQuery({
      queryKey: ["auth-status"],
      queryFn: authService.isAuthenticated,
    });
  };

  return {
    useSignIn,
    useSignUp,
    useSignOut,
    useGoogleSignIn,
    useAuthStatus,
    // Export the service for direct access if needed
    service: authService,
  };
};
