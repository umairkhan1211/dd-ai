import { motion } from "framer-motion";
import { useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import coreFeatures from "@/assets/Hero/coreFeatures.png";
export function FeaturesHeroSection() {
  const featuresRef = useRef<HTMLElement | null>(null);
  const isMobile = useIsMobile();

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <section className="pt-20 md:pt-28 pb-32 h-fit relative overflow-hidden w-full bg-[#020103]">
      {/* Top Glow - Behind everything */}
      <div className="absolute top-[20%] left-1/2 transform -translate-x-1/2 w-[825px] h-[825px] bg-[#622A9A] blur-[150px] rounded-full z-0"></div>

      {/* Concentric Circles */}
      <div className="absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-[35%] z-5">
        <div className="absolute rounded-full border border-white/5 w-[1200px] h-[1200px] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute rounded-full border border-white/5 w-[1000px] h-[1000px] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute rounded-full border border-white/5 w-[800px] h-[800px] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="flex flex-col justify-center items-center max-w-[95vw] mx-auto relative z-10 w-full">
        <div className="text-center mx-auto px-4 max-w-[96%]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="font-roboto text-5xl sm:text-5xl md:text-6xl lg:text-8xl font-bold tracking-tight mb-6 text-[#FFFFFF] bg-clip-text z-10 ">
              <span>Transform How Your Mind Works</span>
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="font-roboto text-[#E1E1E1] text-lg md:text-xl text-center mx-auto mb-10 px-4 sm:px-10 md:px-20 lg:px-40 z-20 max-w-[90%]"
          >
            Powered by the Deviation Engine, you can build your own cognitive
            system tailored to your needs. Experience a new way to organize and
            enhance your thoughts.
          </motion.p>
          <motion.div
            className="flex flex-col items-center justify-center gap-4 mt-10 px-4 z-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          >
            <Link to="/signup" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-[216px] h-14 text-xl font-medium font-sans rounded-xl border-none bg-white text-black hover:bg-white hover:text-black relative z-30 hover:scale-105"
                onClick={scrollToFeatures}
              >
                Start Building
              </Button>
            </Link>
          </motion.div>
          {/* <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4 mt-20 mb-20 z-0 min-w-[96%]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          >
            <div className="relative w-full flex items-center justify-center"> */}
              {/* Purple Glow Background Left */}
              {/* <div className="absolute left-[-10rem] top-[35%] transform -translate-y-1/2 w-[900px] h-[300px] bg-[#622A9A] blur-[150px] rounded-full z-0"></div> */}

              {/* Purple Glow Background Right */}
              {/* <div className="absolute right-[-10rem] top-[35%] transform -translate-y-1/2 w-[900px] h-[300px] bg-[#622A9A] blur-[150px] rounded-full z-0"></div> */}

              {/* Placeholder Box with Glow */}
              {/* <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full h-auto z-20"
                transition={{ duration: 0.3, delay: 0.7 }}
              > */}
                {/* <div className="relative flex items-center justify-center w-full h-[600px] rounded-2xl bg-white z-20 shadow-[0_0_60px_20px_rgba(98,42,154,0.5)]"> */}
                  {/* Empty placeholder content */}
                {/* </div>
              </motion.div> */}
            {/* </div>
          </motion.div> */}
        </div>
      </div>
    </section>
  );
}
