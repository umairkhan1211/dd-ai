import apiClient from "@/lib/api";
import { SignInPayload, SignUpPayload, AuthResponse } from "@/hooks/use-auth";

// Authentication service with API methods
export const authService = {
  // Sign in with email and password
  async signIn(credentials: SignInPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      "/auth/signin",
      credentials
    );
    return response.data;
  },

  async signUp(userData: SignUpPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      "/auth/signup",
      userData
    );
    return response.data;
  },

  async googleSignIn(): Promise<void> {
    // Redirect to Google OAuth endpoint
    window.location.href = `${apiClient.defaults.baseURL}/auth/google`;
    // This will redirect to Google, and then back to our app
    // The actual response will be handled by the OAuth callback route
  },

  // Sign out the current user
  async signOut(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  },

  // Check if the user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      // Make a request to a protected endpoint that will return 401 if not authenticated
      const response = await apiClient.get("/user/me");
      return true;
    } catch (error) {
      return false;
    }
  },

  async updateUser(data): Promise<boolean> {
    try {
      // Make a request to a protected endpoint that will return 401 if not authenticated
      const response = await apiClient.put("/user/me", data);
      return true;
    } catch (error) {
      return false;
    }
  },

  // Get the current user's auth token
  getToken(): string | null {
    return localStorage.getItem("auth-token");
  },

  // Store authentication token
  setToken(token: string): void {
    localStorage.setItem("auth-token", token);
  },

  async resendOtp(email: string | undefined): Promise<void> {
    if (!email) return;
    await apiClient.post("/auth/resend-otp", { email });
  },

  async verifyOtp(payload: { email: string | undefined; otp: string }): Promise<void> {
    await apiClient.post("/auth/verify-otp", payload);
  },

};

export default authService;
