import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

interface OtpVerificationModalProps {
  isOpen: boolean;
  email: string | null;
  onClose: () => void;
  onVerify: (otp: string) => Promise<void>;
  onResend: (email: string | null) => Promise<void> | void;
  initialTimer?: number; // default 30s or 300s depending on flow
}

const OtpVerificationModal = ({
  isOpen,
  email,
  onClose,
  onVerify,
  onResend,
  initialTimer = 30,
}: OtpVerificationModalProps) => {
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(initialTimer);

  useEffect(() => {
    if (isOpen) {
      setTimer(initialTimer);
      setOtp("");
    }
  }, [isOpen, initialTimer]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleVerify = async () => {
    try {
      await onVerify(otp);
      onClose();
    } catch {
      toast({
        title: "Invalid OTP",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResend = () => {
    setTimer(initialTimer);
    onResend(email);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <h2 className="text-xl font-bold mb-2 text-[#232323]">
          Verification Required
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          We sent an OTP to <span className="font-semibold">{email}</span>
        </p>

        {/* OTP Input */}
        <input
          type="text"
          maxLength={6}
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full border border-gray-300 text-black rounded-md px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-[#5243C2] text-center tracking-[0.3em]"
        />

        {/* Timer + Resend */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
          {timer > 0 ? (
            <span>
              Resend available in {Math.floor(timer / 60)}:
              {(timer % 60).toString().padStart(2, "0")}
            </span>
          ) : (
            <button
              onClick={handleResend}
              className="text-[#5243C2] font-medium hover:underline"
            >
              Resend OTP
            </button>
          )}
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={!otp}
          className="w-full bg-[#5243C2] text-white py-2 px-4 rounded-md hover:bg-[#4334A8] disabled:opacity-50"
        >
          Verify Now
        </button>
      </motion.div>
    </motion.div>
  );
};

export default OtpVerificationModal;
