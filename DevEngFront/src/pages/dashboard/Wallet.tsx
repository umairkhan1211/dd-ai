// src/pages/dashboard/Wallet.tsx

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { UserWalletDisplay } from "@/components/deviation/UserWalletDisplay";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useUserWallet } from "@/hooks/use-wallet"; // Import the wallet hook



// Animation variants for staggered animation (consistent with Subscription.tsx)
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



const Wallet = () => {
  const { isLoading, isError, error } = useUserWallet(); // Use the wallet hook to get loading/error states

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="ml-3 text-lg text-muted-foreground">Loading your wallet data...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="flex flex-col justify-center items-center h-96 text-center">
          <p className="text-red-500 text-lg">
            Failed to load your wallet information.
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
          className="max-w-6xl mx-auto px-4 py-8 md:py-12"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div className="text-center mb-12 " variants={item}>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-color font-ubuntu">
              Your Digital Wallet
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto font-ubuntu">
              View your current Duck balance, monthly allowances, and content
              creation limits.
            </p>
          </motion.div>

          {/* The main wallet display component */}
          <motion.div variants={item} >
            <UserWalletDisplay item={item} />
          </motion.div>
        </motion.div>

    </DashboardLayout>
  );
};

export default Wallet;
