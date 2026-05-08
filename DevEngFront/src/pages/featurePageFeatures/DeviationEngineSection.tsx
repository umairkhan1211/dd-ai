import { motion } from "framer-motion";
import { DeviationEngineSectionProps } from "@/models/DeviationEngineProps"; // Adjust path if needed

export const DeviationEngineSection = ({
  title,
  heading,
  description,
  cards,
  showLearnMore,
}: DeviationEngineSectionProps) => {
  return (
    <motion.div
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  transition={{ duration: 0.4, ease: "easeOut", delay: 0 }}
  viewport={{ once: true, amount: 0.3 }} // triggers earlier
  className="py-14 md:py-20 h-fit relative w-full border border-white/15"
  style={{
    background: "linear-gradient(to bottom, #190D2E, #020103)",
  }}
>
  <motion.div
    className="flex flex-col justify-center items-center max-w-[95vw] mx-auto relative z-10 w-full"
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
    viewport={{ once: true, amount: 0.3 }}
  >
    {/* Title */}
    <motion.div
      className="text-center mx-auto px-4 max-w-[96%]"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
      viewport={{ once: true, amount: 0.3 }}
    >
      <h6 className="font-roboto font-semibold text-[16px] text-white text-center mb-8">
        {title}
      </h6>
    </motion.div>

    {/* Heading */}
    <motion.div
      className="text-center mx-auto px-4 max-w-[96%]"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
      viewport={{ once: true, amount: 0.3 }}
    >
      <h1 className="font-roboto text-4xl sm:text-5xl font-bold tracking-tight mb-6 text-[#FFFFFF] z-10">
        {heading}
      </h1>
    </motion.div>

    {/* Description */}
    {description && (
      <motion.p
        className="font-roboto text-[#E1E1E1] text-lg md:text-xl text-center mx-auto mb-10 px-4 sm:px-10 md:px-20 lg:px-40 z-20 max-w-[90%]"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
        viewport={{ once: true, amount: 0.3 }}
      >
        {description}
      </motion.p>
    )}

    {/* Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-2 sm:px-4 md:px-6 lg:px-8">
      {cards.map((card, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            ease: "easeOut",
            delay: 0.15 + index * 0.08, // subtle stagger
          }}
          viewport={{ once: true, amount: 0.3 }}
          className="rounded-2xl p-6 text-center backdrop-blur-md"
        >
          {card.imageUrl ? (
            <img
              loading="lazy"
              src={card.imageUrl}
              alt={`Card ${index + 1}`}
              className="w-[610px] max-h-[380px] object-fit aspect-square rounded-lg mb-6"
            />
          ) : (
            <div className="w-full h-[340px]  bg-white rounded-lg mb-6" />
          )}

          <h3 className="font-roboto font-bold text-[20px] text-white text-center mb-2 px-2 sm:px-4">
            {card.title}
          </h3>

          <p className="font-roboto text-sm text-gray-300 text-center p-2 px-2 sm:px-4">
            {card.description}
          </p>
        </motion.div>
      ))}
    </div>

    {/* Learn More */}
    {showLearnMore && (
      <motion.div
        className="text-center mx-auto px-4 max-w-[96%]"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <p className="mt-8 font-roboto font-bold text-[20px] text-white underline">
          Learn more
        </p>
      </motion.div>
    )}
  </motion.div>
</motion.div>

  );
};
