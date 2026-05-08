import { motion } from "framer-motion";
import doughnut from "@/assets/AboutUs/doughnut.png";
import star from "@/assets/AboutUs/star.png";
/**
 * "The Brain Behind the Bird" section
 * – Built with Framer Motion for smooth, staggered entrance animations
 * – Only one decorative image (top‑right) — bottom‑left graphic removed per spec
 */
export const BrainSection = () => {
  // Variants for orchestrating staggered children delays
  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.2, // delay between children
        delayChildren: 0.2, // initial delay before first child
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  /**
   * Feature bullets (title + description)
   */
  const features = [
    {
      title: "Prompt Logic Layers",
      text: "Modular instructions and reusable thinking blocks",
    },
    {
      title: "Interfaces that Think",
      text: "Buttons, cast members, and tools that mirror your mental flow",
    },
    {
      title: "Protocols and Automations",
      text: "From simple tasks to full workflows with one click",
    },
  ];

  return (
    <section className="relative w-full bg-[#F5F5FA] py-24 px-4 sm:px-6 md:px-8 overflow-visible z-50">
      {/* Decorative ring — top‑right */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotate: 15 }}
        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
        viewport={{ once: true }}
        className="pointer-events-none select-none absolute -top-7 right-[-60px] sm:right-[-40px] md:right-[-120px] lg:right-[-60] w-40 sm:w-52 md:w-64 z-10"
      >
        <img loading="lazy" src={doughnut} alt="Decorative abstract ring" />
      </motion.div>

      {/* Main content with staggered children */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="max-w-[90%] mx-auto text-center"
      >
        {/* Headline */}
        <motion.h1
          variants={item}
          className="text-[32px] sm:text-[40px] md:text-[48px] leading-[120%] font-bold font-roboto mb-2 text-black"
        >
          The Brain Behind the Bird
        </motion.h1>

        {/* Sub‑headline */}
        <motion.p
          variants={item}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-[20px] sm:text-[22px] leading-[150%] font-normal text-gray-800 font-roboto mb-12"
        >
          The Deviation Engine powers Disruptive Duck AI. It's a unique system
          built on:
        </motion.p>

        {/* Feature bullets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24 lg:gap-32 mt-36 max-w[80%] mx-auto">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="w-full max-w-sm md:max-w-md lg:max-w-lg flex flex-col items-center text-center"
            >
              <h3 className="text-xl md:text-2xl font-semibold font-roboto mb-2 text-black">
                {feature.title}
              </h3>
              <p className="text-lg md:text-xl font-roboto max-w-full text-black/80">
                {feature.text}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
      {/* Decorative star — bottom-left, half overlapping next section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
        className="pointer-events-none select-none absolute -bottom-22 left-[-60px] sm:left-[-40px] md:left-[-80px] lg:left-[-76px] w-56 sm:w-64 md:w-80 z-50 rotate-[24deg]"
      >
        <img loading="lazy" src={star} alt="Decorative star" />
      </motion.div>
    </section>
  );
};
