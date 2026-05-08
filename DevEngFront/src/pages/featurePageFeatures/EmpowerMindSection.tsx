import { motion } from "framer-motion";
import { EmpowerMindSectionProps } from "@/models/EmpowerMindSectionProps"; // adjust the path if needed

export function EmpowerMindSection({
  title = "Empower Your Mind Today",
  description = "Unlock the potential of your cognitive system with our innovative tools and personalized features.",
  primaryLabel = "Start now",
  secondaryLabel = "See Pricing",
  imageSrc = null,
  onPrimaryClick,
  onSecondaryClick,
}: EmpowerMindSectionProps) {
  const base = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: 0.8, ease: "easeOut" },
  };

  return (
    <motion.section
      {...base}
      className="w-full border border-white/15 bg-gradient-to-b from-[#190D2E] to-[#020103] py-14 md:py-20 px-6 sm:px-12 md:px-24"
    >
      <div className="w-full flex flex-col md:flex-row items-center md:items-start gap-12">
        {/* LEFT – Copy & CTAs */}
        <div className="md:basis-2/3 w-full flex flex-col items-center md:items-start text-center md:text-left space-y-10">
          <motion.h2
            {...base}
            transition={{ ...base.transition, delay: 0.2 }}
            style={{ fontFamily: "Roboto, sans-serif" }}
            className="max-w-[1000px] text-[36px] sm:text-[44px] md:text-[56px] lg:text-[64px] font-bold leading-[1.2] text-white"
          >
            {title}
          </motion.h2>

          {/* ✅ Added: whiteSpace: "pre-line" to preserve \n line breaks */}
          <motion.p
            {...base}
            transition={{ ...base.transition, delay: 0.35 }}
            style={{
              fontFamily: "Roboto, sans-serif",
              whiteSpace: "pre-line", // 👈 this line added
            }}
            className="max-w-xl text-lg sm:text-xl leading-[1.5] font-normal tracking-normal text-white/80"
          >
            {description}
          </motion.p>

          <motion.div
            {...base}
            transition={{ ...base.transition, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 sm:gap-6"
          >
            <button
              onClick={() => onPrimaryClick?.()}
              className="rounded-xl h-14 bg-white px-8 py-4 font-semibold text-black shadow-sm text-xl transition-transform duration-200 hover:scale-105"
            >
              {primaryLabel}
            </button>
            <button
              onClick={() => onSecondaryClick?.()}
              className="font-semibold text-white text-xl hover:underline"
            >
              {secondaryLabel}
            </button>
          </motion.div>
        </div>

        {/* RIGHT – Image or Placeholder */}
        <motion.div
          {...base}
          transition={{ ...base.transition, delay: 0.65 }}
          className={`md:basis-1/3 w-full h-[22rem] sm:h-[26rem] md:h-[32rem] rounded-3xl ${
            imageSrc ? "overflow-hidden" : "bg-white"
          }`}
        >
          {imageSrc && (
            <img
              loading="lazy"
              src={imageSrc}
              alt={title}
              className="w-full h-full object-cover rounded-3xl"
            />
          )}
        </motion.div>
      </div>
    </motion.section>
  );
}
