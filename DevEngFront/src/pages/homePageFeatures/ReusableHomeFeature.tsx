import { motion } from "framer-motion";
import { ReusableHomeFeatureProps } from "@/models/ReusableHomeFeatureProps";
import React from "react";

export const ReusableHomeFeature: React.FC<ReusableHomeFeatureProps> = ({
  title,
  heading,
  description,
  features,
  rightContent,
  imageSrc,
  imageAlt,
}) => {
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
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const featureVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 px-4 sm:px-6 lg:px-12"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      {/* Left Column */}
      <div className="space-y-3">
        {title && (
          <motion.p
            className="font-roboto text-[16px] sm:text-[18px] text-[#E1E1E1] text-center sm:text-left"
            variants={itemVariants}
          >
            {title}
          </motion.p>
        )}

        <div className="space-y-8 sm:space-y-12">
          {heading && (
            <motion.h2
              className="font-roboto font-bold text-[28px] sm:text-[36px] md:text-[42px] lg:text-[64px] leading-tight text-white mt-0 mb-4 sm:mb-6 text-center sm:text-left mx-auto sm:mx-0 max-w-xl"
              variants={itemVariants}
              transition={{ delay: 0.1 }}
            >
              {heading}
            </motion.h2>
          )}

          {description && (
            <motion.p
              className="font-roboto text-[18px] sm:text-[20px] text-[#E1E1E1] text-center sm:text-left mx-auto sm:mx-0 max-w-2xl"
              variants={itemVariants}
              transition={{ delay: 0.2 }}
            >
              {description}
            </motion.p>
          )}
        </div>

        {features && features.length > 0 && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center sm:items-start gap-2 text-center sm:text-left"
                variants={featureVariants}
                transition={{ delay: index * 0.15 }}
              >
                {feature.icon && (
                  <motion.div
                    className="mt-1"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: index * 0.15 + 0.3,
                      type: "spring",
                      stiffness: 200,
                    }}
                  >
                    {feature.icon}
                  </motion.div>
                )}
                <div className="max-w-md">
                  <motion.h3
                    className="font-roboto font-bold text-[18px] sm:text-[20px] text-white mb-2 mt-4 text-center sm:text-left"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.15 + 0.4 }}
                  >
                    {feature.title}
                  </motion.h3>
                  <motion.p
                    className="font-roboto text-[16px] sm:text-[18px] text-[#E1E1E1] text-center sm:text-left"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.15 + 0.5 }}
                  >
                    {feature.description}
                  </motion.p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Right Column */}
      {rightContent && (
        <motion.div
          className="w-full flex flex-col items-end relative"
          variants={itemVariants}
          transition={{ delay: 0.3 }}
        >
          {/* Optional Image */}
          {imageSrc && (
            <motion.img
              loading="lazy"
              src={imageSrc}
              alt={imageAlt}
              className="hidden lg:block absolute -right-20 -top-36 w-60 h-auto z-50 rotate-[90deg]"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
            />
          )}

          <motion.div
            className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
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
