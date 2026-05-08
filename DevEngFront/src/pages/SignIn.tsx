import { motion } from "framer-motion";
import { AuthResponse, useAuth } from "@/hooks/use-auth";
import mainLogo from "@/assets/login/mainLogo.png";
import image from "@/assets/login/RightColumnImage.jpg";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import authService from "@/services/authService";
import OtpVerificationModal from "@/components/tasks/OtpVerificationModal";

const SignIn = () => {
  const { useSignIn } = useAuth();
  const signInMutation = useSignIn();
  const [showPassword, setShowPassword] = useState(false); // 👁️ Toggle state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { useSignUp, useGoogleSignIn } = useAuth();
  const googleSignInMutation = useGoogleSignIn();
  const navigate = useNavigate();

  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(
    null,
  );

  interface ErrorResponse {
    message: string;
    statusCode?: number;
    requiresVerification?: boolean;
  }
  // const handleSignIn = (email: string, password: string) => {
  //   signInMutation.mutate({ email, password });
  // };
  const handleSignIn = (email: string, password: string) => {
    signInMutation.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          toast({
            title: "Sign in successful",
            description: "You have been signed in successfully.",
          });
          navigate("/dashboard", { state: { user: data.user } });
        },
        onError: (error: AxiosError<ErrorResponse>) => {
          if (
            error.response?.status === 403 &&
            error.response.data?.requiresVerification
          ) {
            // verification modal trigger
            setVerificationEmail(email);
            setVerificationModalOpen(true);
          } else {
            const errorMessage =
              error.response?.data?.message ??
              "Invalid email or password. Please try again.";
            toast({
              title: "Sign in failed",
              description: errorMessage,
              variant: "destructive",
            });
          }
        },
      },
    );
  };

  const handleGoogleSignUp = () => {
    googleSignInMutation.mutate(); // This will trigger the redirect via authService.googleSignIn()
  };

  return (
    <motion.div
      className="min-h-screen w-full flex items-center justify-center bg-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-full max-w-6xl mx-auto flex flex-col md:flex-row rounded-xl shadow-[0_0_10px_rgba(0,0,0,0.15)] overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Left Side - Form */}
        <motion.div
          className="w-full md:w-[44%] p-8 flex flex-col"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <img src={mainLogo} alt="Main Logo" className="h-8" />
          </motion.div>

          <motion.div
            className="max-w-xs mx-auto w-full flex flex-col my-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.h1
              className="text-[40px] font-bold text-[#232323] font-[Inter] leading-[110%] tracking-[-4%] mb-1"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              Sign in
            </motion.h1>

            <motion.p
              className="text-[#969696] text-lg font-normal leading-[150%] tracking-normal font-[Inter] mb-6"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              Please login to continue to your account.
            </motion.p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (e.currentTarget.checkValidity()) {
                  handleSignIn(email, password);
                } else {
                  e.currentTarget.reportValidity();
                }
              }}
            >
              <motion.div className="space-y-4">
                {/* Email Field */}
                <motion.div className="relative w-full">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder=" "
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-black peer w-full px-3 pt-3.5 pb-2 text-base border border-gray-300 rounded-md 
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="email"
                    className={`absolute left-3 bg-white px-1 text-sm transition-all duration-200
            ${email ? "top-[-10px] text-blue-500" : "top-[16px] text-[#9a9a9a]"}
            peer-focus:top-[-10px] peer-focus:text-blue-500`}
                  >
                    Email
                  </label>
                </motion.div>

                {/* Password Field */}
                <motion.div className="relative w-full mt-4">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder=" "
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-black peer w-full px-3 pt-3.5 pb-2 pr-10 text-base border border-gray-300 rounded-md 
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="password"
                    className={`absolute left-3 bg-white px-1 text-sm transition-all duration-200
            ${
              password
                ? "top-[-10px] text-blue-500"
                : "top-[16px] text-[#9a9a9a]"
            }
            peer-focus:top-[-10px] peer-focus:text-blue-500`}
                  >
                    Password
                  </label>

                  <div
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </motion.div>

                {/* Remember Me */}
                <motion.div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Keep me logged in
                    </label>
                  </div>
                </motion.div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={signInMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 bg-[#5243C2] text-white py-2 px-4 rounded-md hover:bg-[#4334A8] focus:outline-none focus:ring-2 focus:ring-[#5243C2] focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {signInMutation.isPending && (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                  )}
                  {signInMutation.isPending ? "Signing in..." : "Sign in"}
                </button>
              </motion.div>
            </form>

            {/* Divider */}
            <motion.button
              className="w-full my-6 border border-gray-300 rounded-md py-2 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition text-gray-700" // <--- Added text-gray-700 here
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignUp}
            >
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                className="mr-2 h-5 w-5"
                style={{ display: "block" }}
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                ></path>
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                ></path>
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                ></path>
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                ></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
              Continue with Google
            </motion.button>

            {/* Signup Link */}
            <motion.p
              className="mt-6 text-sm text-center text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Need an account?{" "}
              <a href="/signup" className="font-medium text-black htext-black">
                Create one
              </a>
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Right Side - Image */}
        <motion.div
          className="hidden md:block md:w-[56%] bg-gray-100"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img
            src={image}
            alt="Sign In Visual"
            className="w-full h-full object-cover p-2 rounded-3xl"
          />
        </motion.div>
      </motion.div>

      {verificationModalOpen && (
        <OtpVerificationModal
          isOpen={verificationModalOpen}
          email={verificationEmail}
          onClose={() => setVerificationModalOpen(false)}
          onVerify={async (otp) => {
            await authService.verifyOtp({ email: verificationEmail, otp });
            navigate("/dashboard");
          }}
          onResend={(email) => authService.resendOtp(email)}
          initialTimer={30}
        />
      )}
    </motion.div>
  );
};

export default SignIn;
