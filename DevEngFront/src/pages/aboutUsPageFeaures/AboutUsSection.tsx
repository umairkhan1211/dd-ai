import { motion } from "framer-motion";
import cubeImage from "@/assets/AboutUs/cube.png";
import AboutUsImage from "@/assets/AboutUs/AboutUsImage.png";
export const AboutUsSection = () => {
  return (
    <div className="w-full bg-[#F5F5FA] py-12 px-4 sm:px-6 md:px-8 overflow-hidden">
      {/* Heading row */}
      <motion.h1
        className="text-[40px] sm:text-[48px] md:text-[64px] leading-[120%] font-bold tracking-normal align-middle text-center mb-12 sm:mb-16 md:mb-20 font-roboto text-black"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        viewport={{ once: true }}
      >
        About us
      </motion.h1>

      {/* Content Row */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
        {/* Left Content */}
        <motion.div
          className="w-full px-1 sm:px-4 md:px-8"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          viewport={{ once: true }}
        >
          <p className="text-base sm:text-lg leading-[150%] font-semibold tracking-normal text-justify align-middle font-roboto mb-3 text-black">
            About us
          </p>

          <h2 className="text-[28px] sm:text-4xl md:text-5xl leading-[120%] font-bold tracking-normal align-middle font-roboto mb-4 sm:mb-6 text-black">
            Who Are we ?
          </h2>

          <p className="text-[16px] sm:text-[18px] md:text-[20px] leading-[150%] font-normal tracking-normal text-justify align-middle font-roboto text-gray-700">
            Disruptive Duck AI is not just another productivity tool — it's a
            system born from deep thinking, personal experimentation, and the
            desire to build something that truly supports how people think. This
            page tells the story behind the system, the mission driving it, and
            the people shaping its evolution.
          </p>
        </motion.div>

        {/* Right Content - Image Section */}
     <motion.div
  className="relative flex justify-center items-center w-full min-h-[280px] sm:min-h-[320px] md:min-h-[400px]"
  initial={{ opacity: 0, x: 40 }}
  whileInView={{ opacity: 1, x: 0 }}
  transition={{ delay: 0.5, duration: 0.7 }}
  viewport={{ once: true }}
>
  {/* Constrain the width here */}
  <div className="relative w-full max-w-[740px] px-4 sm:px-6 md:px-8">
    {/* White box with full-size image inside */}
    <div className="relative w-full h-[260px] sm:h-[330px] md:h-[560px] bg-white rounded-3xl shadow-xl z-10 overflow-hidden">
      <img
      loading="lazy"
        src={AboutUsImage}
        alt="About Us"
        className="absolute inset-0 w-full h-auto object-fit"
      />
    </div>

    {/* Cube image positioned overlapping */}
    <img
    loading="lazy"
      src={cubeImage}
      alt="Cube"
      className="w-28 sm:w-36 md:w-52 absolute -top-10 sm:-top-16 md:-top-20 right-0 translate-x-6 sm:translate-x-10 md:translate-x-16 z-20"
    />
  </div>
</motion.div>
      </div>
    </div>
  );
};
