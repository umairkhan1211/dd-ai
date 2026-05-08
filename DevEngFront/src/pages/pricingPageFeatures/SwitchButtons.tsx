import { motion } from "framer-motion";

interface ToggleTabProps {
  selectedTab: "monthly" | "yearly";
  onChange: (tab: "monthly" | "yearly") => void;
}

export const SwitchButton = ({ selectedTab, onChange }: ToggleTabProps) => {
  return (
    <motion.div
      className="flex justify-center mb-12 sm:mb-16 md:mb-20"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <motion.div
        className="flex rounded-[22px] border"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        {["monthly", "yearly"].map((tab, index) => {
          const isSelected = selectedTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onChange(tab as "monthly" | "yearly")}
              className={`
                w-[120px] h-[48px] font-poppins font-medium text-[16px] transition-colors 
                ${
                  isSelected
                    ? "bg-[#5243C2] text-[#F496D1] rounded-[22px]"
                    : "bg-white text-[#5243C2]"
                }
                ${
                  !isSelected &&
                  (index === 0 ? "rounded-l-[22px]" : "rounded-r-[22px]")
                }
              `}
            >
              {tab === "monthly" ? "Monthly" : "Yearly"}
            </button>
          );
        })}
      </motion.div>
    </motion.div>
  );
};
