import { motion } from "framer-motion";
import { useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import coreFeatures from "@/assets/Hero/coreFeatures.png";

export function HeroSection() {
  const featuresRef = useRef<HTMLElement | null>(null);
  const isMobile = useIsMobile();

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="pt-20 md:pt-28 pb-0 h-fit relative overflow-hidden w-full bg-[#020103]">
      <div className="absolute top-[20%] left-1/2 transform -translate-x-1/2 w-[500px] md:w-[700px] lg:w-[825px] h-[500px] md:h-[700px] lg:h-[825px] bg-[#622A9A] blur-[150px] rounded-full z-0"></div>

      {/* Concentric Circles */}
      <div className="absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-[35%] z-5">
        {[1200, 1000, 800].map((size) => (
          <div
            key={size}
            className={`absolute rounded-full border border-white/5 w-[${size}px] h-[${size}px] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2`}
          ></div>
        ))}
      </div>

      <div className="flex flex-col justify-center items-center max-w-[95vw] mx-auto relative z-10 w-full">
        <div className="text-center mx-auto px-4 w-full max-w-[1280px]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex gap-2 items-center justify-center font-sans text-sm sm:text-base font-normal border border-white/15 rounded-[50px] px-3 py-[0.6rem] mx-auto text-[#9855FF] bg-black w-fit mb-6 sm:mb-8">
              <div className="rounded-[50px] text-black bg-[#9855FF] px-3 py-1 text-xs font-bold">NEW</div>
              <div className="max-sm:text-xs">Latest integration just arrived</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-4 sm:mb-6 text-white">
              <span>Transform Your Thinking</span>
              <br />
              <span>with Disruptive Duck AI</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="font-roboto text-sm sm:text-lg md:text-xl lg:text-2xl text-[#E1E1E1] mx-auto mb-8 sm:mb-10 px-4 sm:px-10 lg:px-20"
          >
            Disruptive Duck AI revolutionizes how you interact with technology by adapting to your unique cognitive patterns. Experience a smarter workspace that understands and evolves with your needs.
          </motion.p>

          <motion.div
            className="flex flex-col items-center justify-center gap-4 mt-6 sm:mt-10 px-4 z-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          >
            <div className="relative top-10 border border-white/10 w-32 sm:w-40 h-16 sm:h-20 rounded-xl"></div>
            <Link to="/signup" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-[216px] h-14 text-xl font-medium font-sans rounded-xl border-none bg-white text-black hover:bg-white hover:text-black relative z-30 hover:scale-105"
                onClick={scrollToFeatures}
              >
                Start Free Trial Now
              </Button>

            </Link>
          </motion.div>
        </div>

        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay:0.6 , ease: "easeOut" }}
            className="mt-4"
          >
            <div className="flex gap-2 items-center justify-center font-sans text-sm sm:text-base font-normal border border-green-400 rounded-[50px] px-3 py-[0.6rem] mx-auto text-green-400 bg-black w-fit mb-6 sm:mb-8">
              <div className="rounded-[50px] text-black bg-green-400 px-3 py-1 text-xs font-bold">INFO</div>
              <div className="max-sm:text-xs">No Payment Information Necessary for Trial</div>
            </div>
          </motion.div>



        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-4 mt-10 z-0 w-full px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        >
          <div className="relative w-full flex items-center justify-center">
            <div className="absolute left-[-10rem] top-[35%] transform -translate-y-1/2 w-[500px] md:w-[700px] lg:w-[900px] h-[500px] md:h-[700px] lg:h-[700px] bg-[#622A9A] blur-[150px] rounded-full z-0"></div>
            <div className="absolute right-[-10rem] top-[35%] transform -translate-y-1/2 w-[500px] md:w-[700px] lg:w-[900px] h-[500px] md:h-[700px] lg:h-[700px] bg-[#622A9A] blur-[150px] rounded-full z-0 overflow-hidden"></div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.7 }}
              className="w-full max-w-7xl z-20"
            >
              <div className="relative border-[1rem] sm:border-[2rem] border-b-[3rem] sm:border-b-[4.5rem] border-black w-full z-20 overflow-hidden rounded-xl sm:rounded-2xl">
                <img
                  loading="lazy"
                  src={coreFeatures}
                  alt="Core Features"
                  className="w-full h-auto object-contain pointer-events-none"
                />
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent to-[#050208] pointer-events-none z-30" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
