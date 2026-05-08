import { motion } from "framer-motion";

export const JourneySection = () => {
  // Variants for orchestrating staggered children delays
  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2,
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

  const features = [
    {
      text: "First experiments with language models",
      label: "2022",
    },
    {
      text: "The Deviation Engine framework is born",
      label: "2023",
    },
    {
      text: "Shared with close network, feedback sparks vision",
      label: "2024",
    },
    {
      text: "Disruptive Duck AI launches as a modular cognitive system",
      label: "2025",
    },
  ];

  return (
    <section className="relative w-full bg-[#F5F5FA] py-24 px-4 sm:px-6 md:px-8 overflow-visible z-50">
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
          className="text-[32px] sm:text-[40px] md:text-[48px] leading-[120%] font-bold font-roboto mb-4 text-black"
        >
          Our Journey
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          variants={item}
          className="text-[18px] sm:text-[20px] md:text-[22px] leading-[150%] text-gray-800 font-roboto mb-12"
        >
          From solo project to systemized solution:
        </motion.p>

        {/* Feature bullets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 mt-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={item}
              className="flex flex-col items-center text-center px-4"
            >
              <p className="text-lg md:text-xl font-roboto leading-relaxed text-black">
                {feature.text}
              </p>
              <button
                type="button"
                className="mt-6 inline-block w-[165px] h-[58px] rounded-[10px] px-6 py-2 text-white font-roboto font-semibold shadow-sm"
                style={{ background: "#5243C2" }}
              >
                {feature.label}
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};
