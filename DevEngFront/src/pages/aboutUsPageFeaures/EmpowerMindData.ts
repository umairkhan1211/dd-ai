// EmpowerMindSectionData.ts
import { EmpowerMindSectionProps  } from "@/models/EmpowerMindSectionProps";
import EmpowerMindImage from "@/assets/Features/EmpowerMindImage.png";
export const empowerMindData = (
  navigate: (path: string) => void
): EmpowerMindSectionProps[] => [

{
    title: "Empower Your Mind Today",
    description:
      "Unlock the potential of your cognitive system with our innovative tools and personalized features.",
    primaryLabel: "Start Now",
    secondaryLabel: "See Pricing",
    imageSrc: EmpowerMindImage, //  use the imported image variable
       onPrimaryClick: () => navigate("/signup"),
    onSecondaryClick: () => navigate("/pricing"),
  },
];
