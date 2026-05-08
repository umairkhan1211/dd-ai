import { motion } from "framer-motion";
import doughnut from "@/assets/AboutUs/doughnut.png";

export const OurStorySection = () => {
  return (
    <div className="relative w-full bg-[#F5F5FA] py-12 px-4 sm:px-6 md:px-8 overflow-hidden ">
      <div className="pt-12 pb-12 relative z-10">
        {/* Top-left decorative image */}
      <img
      loading="lazy"
        src={doughnut}
        alt="Doughnut"
        className="absolute top-30 left-[-3rem] w-32 sm:w-44 md:w-52 lg:w-64 -translate-x-1/3 -translate-y-1/3 z-0"
      />

      {/* Content */}
      <div className="max-w-4xl mx-auto text-center">
        <motion.h1
          className="text-[32px] sm:text-[40px] md:text-[48px] leading-[120%] font-bold text-center font-roboto mb-2 z-10 relative text-black"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          viewport={{ once: true }}
        >
          Our Story
        </motion.h1>

        <motion.h2
          className="text-[24px] leading-[150%] font-medium text-justify flex font-roboto mb-8 z-10 relative text-black
  justify-center"
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          viewport={{ once: true }}
        >
          The Origin of the Deviation Engine
        </motion.h2>

        <motion.p
          className="text-[16px] sm:text-[18px] md:text-[20px] leading-[150%] font-normal tracking-normal text-center align-middle font-roboto text-gray-700 mb-6"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          viewport={{ once: true }}
        >
          The Deviation Engine wasn’t designed it emerged. It started as a
          personal solution, a custom prompt framework crafted by a
          neurodivergent creator blending data science, programming, and a
          passion for language. Built to reduce overload and increase clarity,
          the system soon became more than a tool—it became a cognitive
          companion.
        </motion.p>

        <motion.p
          className="text-[16px] sm:text-[18px] md:text-[20px] leading-[150%] font-normal tracking-normal text-center align-middle font-roboto text-gray-700"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          viewport={{ once: true }}
        >
          What began as a solitary project spread organically. Friends and
          family tried it. Loved it. Wanted more. And so, the experiment turned
          into a purpose: build tools for minds that need systems their way.
          Disruptive Duck AI was born not to fix how people think, but to
          support it.
        </motion.p>
      </div>
      </div>
    </div>
  );
};
