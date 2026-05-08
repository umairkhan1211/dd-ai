import { motion } from "framer-motion";
import { ReusableFeatureProps } from "@/models/ReusableFeatureProps";
import React from "react";
import { useNavigate } from "react-router-dom";

export const PowerSectionData: React.FC<ReusableFeatureProps> = ({
  title,
  heading,
  description,
  features,
  rightContent,
  imageSrc,
  imageAlt,
}) => {
  // Animation variants
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const featureVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 min-w-[90%] px-4 sm:px-8 md:px-12"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      {/* Left Column */}
      <div className="space-y-8 flex flex-col items-center lg:items-start text-center lg:text-left">
        {title && (
          <motion.p
            className="font-roboto font-normal text-[18px] text-[#E1E1E1]"
            variants={itemVariants}
          >
            {title}
          </motion.p>
        )}

        {heading && (
          <motion.h2
            className="font-roboto font-bold text-[36px] sm:text-[40px] lg:text-[48px] leading-tight text-white max-w-xl"
            variants={itemVariants}
            transition={{ delay: 0.1 }}
          >
            {heading}
          </motion.h2>
        )}

        {description && (
          <motion.p
            className="font-roboto font-normal text-xl text-[#E1E1E1] text-center lg:text-justify"
            variants={itemVariants}
            transition={{ delay: 0.2 }}
          >
            {description}
          </motion.p>
        )}

        {features && features.length > 0 && (
          <motion.div
            className="flex flex-col items-center lg:grid lg:grid-cols-2 gap-8 w-full"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center lg:items-start text-center lg:text-left gap-4 mt-12"
                variants={featureVariants}
                transition={{ delay: index * 0.15 }}
              >
                <motion.h3
                  className="font-roboto font-bold text-[20px] text-white mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.15 + 0.4 }}
                >
                  {feature.title}
                </motion.h3>
                <motion.p
                  className="font-roboto font-normal text-[18px] text-[#E1E1E1]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.15 + 0.5 }}
                >
                  {feature.description}
                </motion.p>

                {/* Show Start Now only for the first feature */}
              </motion.div>
            ))}
            <motion.button
  className="mt-4 bg-white text-black font-roboto font-bold text-xl rounded-[14px] w-[169px] h-[51px]"
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.3, ease: "easeOut" }}
  onClick={() => navigate("/signup")}
>
  Start Now
</motion.button>
          </motion.div>
        )}
      </div>

      {/* Right Column */}
      {rightContent && (
        <motion.div
          className="flex justify-center px-0 sm:px-12"
          variants={itemVariants}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="bg-white rounded-[2rem] w-full sm:w-[80%] h-full overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {rightContent}
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};
