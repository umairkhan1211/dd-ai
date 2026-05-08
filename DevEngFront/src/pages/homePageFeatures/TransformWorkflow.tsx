import { useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import BannerImage from "@/assets/Hero/workflow.png";

export function TransformWorkflow() {
  const featuresRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const isMobile = useIsMobile();

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="py-16 md:py-24 lg:py-32 h-fit relative w-full border border-white/15"
      style={{
        background: "linear-gradient(to bottom, #190D2E, #020103)",
      }}
    >
      <div className="flex flex-col justify-center items-center max-w-[95vw] mx-auto relative z-10 w-full px-4 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mb-12 md:mb-16 w-full flex flex-col items-center"
        >
          {/* Heading & Paragraph */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.8 }}
            className="flex flex-col lg:flex-row justify-between items-center lg:items-start text-white font-roboto gap-8 w-full text-center lg:text-left"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight max-w-2xl">
              Think Smarter Work Faster Build with Disruptive Duck AI.
            </h2>
            <p className="text-sm sm:text-base md:text-xl max-w-2xl">
              Disruptive Duck AI isn’t just another assistant, it’s your
              thinking partner.
              <br />
              Design custom AI personas that understand your workflow, remember
              your preferences, and help you execute ideas from start to finish.
              <br />
              Whether you’re managing a project, writing content, or
              brainstorming, your workspace grows smarter every time you use it,
              adapting to you.
            </p>
          </motion.div>

          {/* Video Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 1.1 }}
            className="mt-12 w-full flex justify-center items-center relative"
          >
            <div className=" z-20 relative rounded-[2rem] overflow-hidden aspect-video bg-black cursor-pointer group w-auto h-fit flex items-center ">
              <img
                loading="lazy"
                src={BannerImage}
                alt="Banner"
                className="w-auto h-auto object-cover rounded-[2rem]"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
