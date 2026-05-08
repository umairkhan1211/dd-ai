import { MainLayout } from "@/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import { SwitchButton } from "./pricingPageFeatures/SwitchButtons";

const pricingPlans = [
  {
    name: "Free Duck",
    price: "FREE",
    period: "",
    description: "Explore & Tinker",
    subdescription:
      "Personal users, students, or curious minds testing the system.",
    features: [
      "3 Cast Members",
      "Default Protocols and 3 custom Level 1 Protocols",
      "Operator Profile",
      "Community support",
    ],
    negatives: [
      "No stacking or recursion",
      "No cast system customization",
      "Level 2 and Level 3 Protocol Creation Locked",
    ],
    buttonText: "Choose plan",
    popular: false,
  },
  {
    name: "Core",
    price: "€14.99",
    period: "/month",
    originalPrice: 20.00,
    discountText: "30% off",
    description: "",
    subdescription:
      "For advanced users and growing projects",
    features: [
      "Unlimited Cast Members",
      "Unlimited Protocols ",
      "All Levels Unlocked",
      "1500 Monthly Ducks Quota",
      "40% rollover unused Ducks",
      "Complete Operator Profile",
      "Document Management",
      "Task Tracking System",
      "Priority Support",
    ],
    buttonText: "Subscribe Now",
    popular: true,
  },
  {
    name: "Multi-Duck Plan",
    description: "Deploy & Scale",
    buttonText: "Coming Soon",
    popular: false,
    isComingSoon: true, // New flag for coming soon plan
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<"monthly" | "yearly">(
    "monthly"
  );

  return (
    <MainLayout>
      <motion.div
        className="w-full bg-[#F5F5FA] py-12 px-4 sm:px-6 md:px-8 overflow-hidden "
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        viewport={{ once: true }}
      >
        <motion.h1
          className="font-poppins font-semibold text-[40px] text-black leading-[100%] tracking-[0px] text-center mb-4 sm:mb-8 md:mb-12"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          viewport={{ once: true }}
        >
          Simple Transparent pricing
        </motion.h1>

        <motion.p
          className="text-center font-poppins font-medium text-[20px] leading-[100%] tracking-[0px] text-gray-700 mb-14 sm:mb-12 md:mb-20"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          viewport={{ once: true }}
        >
          No contracts. No surprise fees.
        </motion.p>

        {/* <SwitchButton selectedTab={selectedTab} onChange={setSelectedTab} /> */}

        <div className="flex justify-center px-4 md:px-0 ">
          <div className=" rounded-[30px]  px-0 md:px-0 pt-0 pb-32  max-w-[1100px]">
            <div className="flex justify-center items-center w-full">
              {pricingPlans
                .filter((plan) => plan.name === "Core")
                .map((plan) => (
                  <motion.div
                    key={plan.name}
                    className={`relative w-full max-w-[360px] rounded-[30px] p-8 transition-all duration-300
          ${plan.popular
                        ? "bg-[#2D176D] text-white py-4 pb-1 shadow-[0_42px_34px_0px_rgba(82,67,194,0.3)] scale-105 z-10 mt-[-2.5rem] h-[60rem]"
                        : "bg-white text-gray-900 py-10"
                      }
          ${plan.isComingSoon ? "h-[550px]" : ""}
        `}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex justify-end z-10 relative">
                      {plan.popular && (
                        <div className="bg-[#5243C2] text-[#F496D1] text-xs font-bold px-4 py-2 rounded-full shadow-md uppercase tracking-wide">
                          Most Popular
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-6 gap-2">
                      <div className="flex flex-col">
                        {plan.name === "Core" && (
                          <div className="flex items-baseline mb-1">
                            <span className="text-lg line-through text-gray-400 font-poppins">
                              €{plan.originalPrice}
                            </span>
                            <span className="ml-2 bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
                              {plan.discountText}
                            </span>
                          </div>
                        )}

                        {!plan.isComingSoon && (
                          <div className="flex items-baseline">
                            <span className="text-[44px] sm:text-[48px] font-bold font-poppins">
                              {plan.price}
                            </span>
                            {plan.period && (
                              <span className="ml-1 text-lg font-medium font-poppins">
                                {plan.period}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <h2
                      className={`text-[32px] font-semibold mb-2 font-poppins ${plan.popular ? "text-white" : "text-[#2D176D]"
                        }`}
                    >
                      {plan.name}
                    </h2>

                    {!plan.isComingSoon ? (
                      <>
                        <p
                          className={`text-[24px] font-semibold mb-1 font-poppins ${plan.popular ? "text-white" : "text-[#2D176D]"
                            }`}
                        >
                          {plan.description}
                        </p>
                        <p
                          className={`text-[16px] font-normal mb-6 font-poppins ${plan.popular ? "text-gray-300" : "text-gray-500"
                            }`}
                        >
                          {plan.subdescription}
                        </p>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[250px]">
                        <div className="bg-[#F5F5FA] rounded-full w-32 h-32 flex items-center justify-center mb-6">
                          <div className="bg-[#ECEAFF] rounded-full w-24 h-24 flex items-center justify-center">
                            <div className="text-2xl font-bold text-[#5243C2]">🚀</div>
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-center text-[#2D176D]">
                          Coming Soon
                        </p>
                        <p className="text-center text-gray-500 mt-3">
                          Powerful team features launching soon
                        </p>
                      </div>
                    )}

                    {!plan.isComingSoon && (
                      <div className="mb-8 space-y-[58px]">
                        <div className="space-y-3">
                          {plan.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center">
                              <div className="w-6 h-6 flex items-center justify-center rounded-full bg-[#ECEAFF]">
                                <Check className="w-4 h-4 text-[#5243C2]" />
                              </div>
                              <span
                                className={`ml-3 font-poppins text-[18px] ${plan.popular ? "text-white" : "text-[#2D176D]"
                                  }`}
                              >
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>

                        {plan.negatives && (
                          <div className="space-y-3 mt-[78px]">
                            {plan.negatives.map((negative, idx) => (
                              <div key={`neg-${idx}`} className="flex items-center">
                                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-[#F67D7D]">
                                  <X className="w-4 h-4 text-white" />
                                </div>
                                <span className="ml-3 text-[18px] font-poppins text-[#2D176D]">
                                  {negative}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {!plan.isComingSoon ? (
                      <Button
                        onClick={() =>
                          !plan.isComingSoon &&
                          navigate("/signup", {
                            state: { selectedPlan: plan.name },
                          })
                        }
                        variant={plan.popular ? "default" : "outline"}
                        className={`w-full py-3 text-[16px] font-semibold font-poppins rounded-full !bg-[#F496D2] !text-[#2D176D] hover:!bg-[#e085c0] ${plan.isComingSoon
                          ? "!bg-gray-100 !text-gray-400 !cursor-not-allowed"
                          : plan.popular
                            ? "!bg-[#F496D2] !text-[#2D176D] hover:!bg-[#e085c0]"
                            : "!border !border-none !text-[#2D176D] hover:!bg-[#5243C2] hover:!text-white"
                          } ${plan.popular && !plan.isComingSoon
                            ? "mt-[206px]" // increased spacing
                            : "mt-24"
                          }`}
                        disabled={plan.isComingSoon}
                      >
                        {plan.buttonText}
                      </Button>
                    ) : (
                      ""
                    )}
                  </motion.div>
                ))}
            </div>

          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default Pricing;
