// EmpowerMindSectionData.ts
import { EmpowerMindSectionProps } from "@/models/EmpowerMindSectionProps";
import EmpowerMindImage from "@/assets/Features/EmpowerMindImage.png";

export const empowerMindData = (
  navigate: (path: string) => void
): EmpowerMindSectionProps[] => [
  // will remove or add objects after confirmation
  // {
  //   title: "Upgrade Your Workflow",
  //   description: "Harness the latest AI-powered tools to streamline your daily tasks.",
  //   primaryLabel: "Get Started",
  //   secondaryLabel: "Learn More",
  //   imageSrc: "",
  // },
  // {
  //   title: "Boost Your Creativity",
  //   description: "Explore tools designed to ignite your creative process and elevate your ideas.",
  //   primaryLabel: "Create Now",
  //   secondaryLabel: "Explore Features",
  //   imageSrc: "",
  // },
  {
    title: "Empower Your Mind Today",
    description: `Turn your thoughts into real results with tools designed to help you think better, work faster, and stay focused.
Deviation gives you a personalized cognitive workspace, built to organize ideas, boost creativity, and bring clarity to your everyday thinking.`,
    primaryLabel: "Start Now",
    secondaryLabel: "See Pricing",
    imageSrc: EmpowerMindImage, //  use the imported image variable
    onPrimaryClick: () => navigate("/signup"),
    onSecondaryClick: () => navigate("/pricing"),
  },
];
