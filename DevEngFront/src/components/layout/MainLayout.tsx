
import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { theme } = useTheme();

  return (
    <div className="flex flex-col min-h-screen w-full bg-black text-foreground transition-colors duration-300">
      <Header />
      <motion.main
        className="flex-1 w-full flex"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
}
