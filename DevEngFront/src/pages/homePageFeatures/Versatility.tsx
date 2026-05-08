import { motion } from "framer-motion";
import { LucideBrain, LucideFolderTree, LucideLightbulb } from "lucide-react";
import versatilityImage from "@/assets/Versatility/versatilityImage.png";

export const Versatility = () => {
  return (
    <section className="w-full py-16 md:py-24 px-4 bg-gradient-to-b from-[#1A0D2F] to-[#020103] text-white h-fit border border-white/15">
      <div className="flex flex-col max-w-[95vw] text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mb-12 md:mb-16 min-w-[90%] mx-auto"
        >
          <img
            loading="lazy"
            src={versatilityImage}
            alt="Versatility"
            className="mx-auto md:mx-0 md:hidden "
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
          className="mb-12 md:mb-16 min-w-[90%] flex flex-col items-center mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.8 }}
            className="text-[#FFFFFF] font-roboto w-full flex flex-col md:flex-row md:justify-between md:items-start gap-6 md:gap-12"
          >
            {/* Heading on the left */}
            <h2 className="font-bold text-[32px] sm:text-[38px] md:text-[48px] lg:text-[52px] leading-tight text-white md:max-w-[50%] text-center md:text-left">
              Explore the Versatility of Disruptive Duck AI
            </h2>

            {/* Paragraph on the right */}
            <p className="text-base sm:text-lg md:text-xl text-[#E1E1E1] text-center md:text-left w-full md:w-[422px]">
              Disruptive Duck AI is designed to adapt to your unique cognitive patterns.
              Discover how it can enhance productivity across various scenarios.
            </p>
          </motion.div>

        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-10 text-left max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
        >
          {/* ADHD & Neurodivergence */}
          <div className="flex flex-col items-center text-center px-4">
            <div className="bg-indigo-900/30 p-4 rounded-full mb-6">
              <LucideBrain size={36} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4">
              ADHD & Neurodivergence
            </h3>
            <p className="text-md text-gray-300 max-w-xs">
              DDAI helps create structure and reduce mental load.
            </p>
          </div>

          {/* Complex Projects */}
          <div className="flex flex-col items-center text-center px-4">
            <div className="bg-purple-900/30 p-4 rounded-full mb-6">
              <LucideFolderTree size={36} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Complex Projects</h3>
            <p className="text-md text-gray-300 max-w-xs">
              Break down goals into manageable systems effortlessly.
            </p>
          </div>

          {/* Creative & Strategic Work */}
          <div className="flex flex-col items-center text-center px-4">
            <div className="bg-pink-900/30 p-4 rounded-full mb-6">
              <LucideLightbulb size={36} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4">
              Creative & Strategic Work
            </h3>
            <p className="text-md text-gray-300 max-w-xs">
              Collaborate with tailored AI personas for your projects.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
