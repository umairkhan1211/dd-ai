import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Features } from "@/components/landing/Features";
import { ModeComparison } from "@/components/landing/ModeComparison";
import { UseCases } from "@/components/landing/UseCases";
import { CastShowcase } from "@/components/landing/CastShowcase";
import { ProtocolsSection } from "@/components/landing/ProtocolsSection";
import { HeroSection } from "./homePageFeatures/HeroSection";
import { TransformWorkflow } from "./homePageFeatures/TransformWorkflow";
import { PowerSection } from "./homePageFeatures/PowerSection";
import { ChallengesSection } from "./homePageFeatures/ChallengesSection";
import { SolutionSection } from "./homePageFeatures/SolutionSection";
import { DiscoverPersonas } from "./homePageFeatures/DiscoverPersonas";
// import { NaturalLanguage } from "./homePageFeatures/NaturalLanguage";
import { Versatility } from "./homePageFeatures/Versatility";

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

const Index = () => {
  const featuresRef = useRef<HTMLElement | null>(null);
  const isMobile = useIsMobile();

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <MainLayout>
      <div className="flex flex-col w-full">
        {/* Hero Section*/}
        <HeroSection />
        {/* Transform Workflow Section */}
        <TransformWorkflow />
        {/* Power Section */}
        <PowerSection />
        {/* Cast System Showcase */}
        <ChallengesSection />
        {/* Solution Section */}
        <SolutionSection />
        {/* User Modes Comparison */}
        <div className="overflow-hidden">
          <DiscoverPersonas />
          {/* Natural Language */}
          {/* <NaturalLanguage /> */}
        </div>

        {/* Versatility Section */}
        <Versatility />
      </div>
    </MainLayout>
  );
};

export default Index;
