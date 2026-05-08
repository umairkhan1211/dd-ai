import { motion } from "framer-motion";
import OurMissionImage from "@/assets/AboutUs/OurMissionImage.png";

/**
 * Animated "Our Mission" section.
 * Uses Framer Motion for smooth staggered entrance animations.
 */
export const OurMissionSection = () => {
  return (
    <motion.section
      id="our-mission"
      className="relative w-full bg-[#F5F5FA] py-12 px-4 sm:px-6 md:px-8 overflow-hidden"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center pb-12 pt-4">
        {/* Left Content */}
        <motion.div
          className="w-full px-1 sm:px-4 md:px-8"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[48px] leading-[120%] text-black font-bold font-roboto tracking-normal align-middle mb-4 sm:mb-6">
            Our Mission
          </h2>

          <p className="text-[16px] sm:text-[18px] md:text-[20px] leading-[150%] font-normal tracking-normal text-justify align-middle font-roboto text-gray-700">
            At Disruptive Duck AI, our mission is to serve high-cognition and
            neurodivergent thinkers by offering modular tools that adapt to
            them.
          </p>
          <p className="text-[16px] sm:text-[18px] md:text-[20px] leading-[150%] font-normal tracking-normal text-justify align-middle font-roboto text-gray-700">
            Traditional productivity systems often impose structure. We flip
            that—providing frameworks that are flexible, intuitive, and
            logic-driven without being rigid. Built through a mix of
            programming, language systems, and cognitive design, DDAI helps
            users think, plan, and act in ways that feel natural.
          </p>
        </motion.div>

        {/* Right Content - Image Section */}
        <motion.div
          className="relative flex justify-center items-center w-full min-h-[280px] sm:min-h-[320px] md:min-h-[400px]"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 0.7 }}
          viewport={{ once: true }}
        >
          <div className="relative w-full max-w-[740px] px-4 sm:px-6 md:px-8">
            <div className="w-full h-[280px] sm:h-[380px] md:h-[670px] bg-white rounded-3xl shadow-xl z-10 overflow-hidden">
              <img
              loading="lazy"
                src={OurMissionImage}
                alt="Our Mission"
                className="w-full h-full object-fit"  
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};
