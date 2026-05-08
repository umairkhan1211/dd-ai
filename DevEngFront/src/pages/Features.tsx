import { MainLayout } from "@/components/layout/MainLayout";
import { motion } from "framer-motion";
// import { Features as FeaturesSection } from "@/components/landing/Features";

import { FeaturesHeroSection } from "@/pages/featurePageFeatures/FeaturesHeroSection";

import { useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { PowerSection } from "./featurePageFeatures/PowerSection";
import { InnovativeFeatureSection } from "./featurePageFeatures/InovativeFeaturesSection";
import { AIPersonasSection } from "./featurePageFeatures/AiPersonasSection";
import { InteractiveCommandSection } from "./featurePageFeatures/InteractiveCommandSection";
import { EmpowerMindSection } from "./featurePageFeatures/EmpowerMindSection";
import { empowerMindData } from "./featurePageFeatures/EmpowerMindSectionData";
import { DeviationEngineData } from "./featurePageFeatures/DeviationEngineData";
import { useNavigate } from "react-router-dom";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: "easeOut" },
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};
const Features = () => {
  const navigate = useNavigate();
  const featuresRef = useRef<HTMLElement | null>(null);
  const isMobile = useIsMobile();

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <MainLayout>
      <div className="flex flex-col w-full">
        {/* Hero Section */}

        <FeaturesHeroSection />

        {/* Deviation Engine Section */}
        <DeviationEngineData/>

        {/* Power Section */}
        <PowerSection />
        {/* Innovative Features Section */}
        <InnovativeFeatureSection />
        {/* AI Personas Section */}
        <AIPersonasSection />
        {/* Interactive Command Section */}
        {/* will remove this section after confimation */}
        {/* <InteractiveCommandSection /> */}
        {/* Empower Mind Section */}
     {empowerMindData(navigate).map((data, index) => (
  <EmpowerMindSection key={index} {...data} />
))}

      </div>
    </MainLayout>
  );
};

export default Features;
