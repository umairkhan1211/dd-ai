
import { MainLayout } from "@/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Brain, CircleCheck } from "lucide-react";
import { AboutUsSection } from "./aboutUsPageFeaures/AboutUsSection";
import { OurStorySection } from "./aboutUsPageFeaures/OurStory";
import { OurMissionSection } from "./aboutUsPageFeaures/OurMission";
import { BrainSection } from "./aboutUsPageFeaures/BrainSection";
import { useNavigate } from "react-router-dom";
import { OurTeam } from "./aboutUsPageFeaures/Team";
import { JourneySection } from "./aboutUsPageFeaures/JourneySection";
import { EmpowerMindSection } from "./aboutUsPageFeaures/EmpowerMind";
import { empowerMindData } from "./aboutUsPageFeaures/EmpowerMindData";
const About = () => {
  const navigate = useNavigate();
  return (
    <MainLayout>
      <div className="flex flex-col w-full">
        {/* Hero Section */}
        <AboutUsSection />

        {/* Our Story Section */}
        <OurStorySection />
       {/* Our Mission */}
<OurMissionSection/>
        
<div className="relative overflow-x-hidden">
  {/* Brain Section */}
  <BrainSection />
  {/* Team Section */}
  <OurTeam />
</div>
{/* Our Journey */}
<JourneySection />
  {/*Empower Mind Section  */}
   {empowerMindData(navigate).map((data, index) => (
          <EmpowerMindSection key={index} {...data} />
        ))}
      </div>
    </MainLayout>
  );
};

export default About;
