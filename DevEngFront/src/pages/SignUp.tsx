import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import mainLogo from "@/assets/login/mainLogo.png";
import image from "@/assets/login/RightColumnImage.jpg";
import { useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import OtpVerificationModal from "@/components/tasks/OtpVerificationModal";
import authService from "@/services/authService";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const { useSignUp, useGoogleSignIn } = useAuth();
  const signUpMutation = useSignUp();
  const googleSignInMutation = useGoogleSignIn();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(""); // Error state for retype password
  const navigate = useNavigate();

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const dobRef = useRef<HTMLInputElement>(null);

  const validateName = (name: string) => {
    if (!name) return "Name is required";
    if (!/^[A-Za-z\s]+$/.test(name)) {
      return "Name must contain only letters and spaces";
    }
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "At least 8 characters required";
    if (!/[A-Z]/.test(password)) return "Must include uppercase letter";
    if (!/[0-9]/.test(password)) return "Must include a number";
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password))
      return "Must include special character";
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      let errorMessage = "";

      if (name === "name") {
        errorMessage = validateName(value);
      }

      if (name === "password") {
        errorMessage = validatePassword(value);
      }

      if (name === "confirmPassword") {
        if (value !== updated.password) {
          errorMessage = "Passwords do not match";
        }
      }

      // also check confirm password again if password changes
      if (name === "password" && updated.confirmPassword) {
        if (updated.confirmPassword !== value) {
          errorMessage = "Passwords do not match";
        }
      }

      setError(errorMessage);
      return updated;
    });
  };

  const handleSignUp = () => {
    const nameError = validateName(formData.name);
    const passwordError = validatePassword(formData.password);

    if (nameError) {
      setError(nameError);
      return;
    }

    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    signUpMutation.mutate(
      {
        email: formData.email,
        password: formData.password,
        name: formData.name,
      },
      {
        onSuccess: () => {
          setUserEmail(formData.email);
          setShowOtpModal(true);
        },
        onError: (err: any) => {
          setError(err?.response?.data?.message || err.message);
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
        className="w-full max-w-6xl mx-auto my-5 flex flex-col md:flex-row rounded-xl shadow-[0_0_10px_rgba(0,0,0,0.15)] overflow-hidden"
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
              Sign up
            </motion.h1>

            <motion.p
              className="text-[#969696] text-lg font-normal leading-[150%] tracking-normal font-[Inter] mb-6"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              Sign up to enjoy the feature of Disruptive Duck AI
            </motion.p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (e.currentTarget.checkValidity()) {
                  handleSignUp();
                } else {
                  e.currentTarget.reportValidity();
                }
              }}
            >
              <motion.div className="space-y-4">
                {/* Name Field */}
                <motion.div className="relative w-full">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder=" "
                    value={formData.name}
                    onChange={handleChange}
                    className="text-black peer w-full px-3 pt-3.5 pb-2 text-base border border-gray-300 rounded-md 
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="name"
                    className={`absolute left-3 bg-white px-1 text-sm transition-all duration-200
                      ${
                        formData.name
                          ? "top-[-10px] text-blue-500"
                          : "top-[16px] text-[#9a9a9a]"
                      }
                      peer-focus:top-[-10px] peer-focus:text-blue-500`}
                  >
                    Your Name
                  </label>
                </motion.div>

                {/* Date of Birth Field */}
                {/* <motion.div className="relative w-full">
                    <input
                      id="dob"
                      name="dob"
                      type="date"
                      required
                      ref={dobRef}
                      value={formData.dob}
                      onChange={handleChange}
                      onFocus={() => dobRef.current?.showPicker?.()}
                      onClick={() => dobRef.current?.showPicker?.()}
                      className={`peer w-full px-3 pt-3.5 pb-2 text-base border border-gray-300 rounded-md 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 
                    ${!formData.dob ? "text-transparent" : "text-gray-900"}`} //  Correct interpolation
                    />

                    <label
                      htmlFor="dob"
                      className={`absolute left-3 bg-white px-1 text-sm transition-all duration-200
                                ${
                                  formData.dob
                                    ? "top-[-10px] text-blue-500"
                                    : "top-[16px] text-[#9a9a9a]"
                                }
                                peer-focus:top-[-10px] peer-focus:text-blue-500`}
                    >
                      Date of Birth
                    </label>
                  </motion.div> */}

                {/* Email Field */}
                <motion.div className="relative w-full">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder=" "
                    value={formData.email}
                    onChange={handleChange}
                    className="text-black peer w-full px-3 pt-3.5 pb-2 text-base border border-gray-300 rounded-md 
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="email"
                    className={`absolute left-3 bg-white px-1 text-sm transition-all duration-200
                      ${
                        formData.email
                          ? "top-[-10px] text-blue-500"
                          : "top-[16px] text-[#9a9a9a]"
                      }
                      peer-focus:top-[-10px] peer-focus:text-blue-500`}
                  >
                    Email
                  </label>
                </motion.div>

                {/* Password Field */}
                <motion.div className="relative w-full">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder=" "
                    value={formData.password}
                    onChange={handleChange}
                    className="text-black peer w-full px-3 pt-3.5 pb-2 pr-10 text-base border border-gray-300 rounded-md 
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="password"
                    className={`absolute left-3 bg-white px-1 text-sm transition-all duration-200
                      ${
                        formData.password
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

                {/* Confirm Password Field */}
                <motion.div className="relative w-full">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder=" "
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="text-black peer w-full px-3 pt-3.5 pb-2 pr-10 text-base border border-gray-300 rounded-md 
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="confirmPassword"
                    className={`absolute left-3 bg-white px-1 text-sm transition-all duration-200
                    ${
                      formData.confirmPassword
                        ? "top-[-10px] text-blue-500"
                        : "top-[16px] text-[#9a9a9a]"
                    }
                    peer-focus:top-[-10px] peer-focus:text-blue-500`}
                  >
                    Confirm Password
                  </label>
                  <div
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </div>
                  {/*  Inline validation message */}
                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                  )}
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={signUpMutation.isPending}
                  className={`w-full flex justify-center items-center gap-2 bg-[#5243C2] text-white py-2 px-4 rounded-md hover:bg-[#4334A8] focus:outline-none focus:ring-2 focus:ring-[#5243C2] focus:ring-offset-2 mt-4 ${
                    signUpMutation.isPending
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {signUpMutation.isPending && (
                    <span className="loader border-2 border-white border-t-transparent rounded-full w-5 h-5 animate-spin"></span>
                  )}
                  <span>Sign up</span>
                </motion.button>
              </motion.div>
            </form>

            {/* Divider */}
            <motion.div className="my-6 flex items-center">
              <div className="flex-grow h-px bg-gray-300"></div>
              <span className="mx-4 text-sm text-gray-500">or</span>
              <div className="flex-grow h-px bg-gray-300"></div>
            </motion.div>

            {/* Google Sign In */}
            <motion.button
              className="w-full border border-gray-300 rounded-md py-2 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition text-gray-700" // <--- Added text-gray-700 here
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

            {/* Signin Link */}
            <motion.p
              className="mt-6 text-sm text-center text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Already have an account?{" "}
              <a
                href="/signin"
                className="font-medium text-black hover:text-black"
              >
                Sign in
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
            alt="Sign Up Visual"
            className="w-full h-full object-cover p-2 rounded-3xl"
          />
        </motion.div>
      </motion.div>
      <OtpVerificationModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        email={userEmail}
        onVerify={async (otp) => {
          await authService.verifyOtp({ email: userEmail, otp });
          navigate("/signin");
        }}
        onResend={(email) => authService.resendOtp(email)}
      />
    </motion.div>
  );
};

export default SignUp;
