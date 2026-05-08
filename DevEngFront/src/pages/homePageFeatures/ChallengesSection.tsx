import { CogIcon, LightbulbIcon } from "lucide-react";
import { ReusableHomeFeature } from "./ReusableHomeFeature";
import ThinkerImage from "@/assets/Hero/thinkersSection.png";
export const ChallengesSection = () => {
  return (
    <div
      className="py-14 md:py-20 h-fit relative w-full border border-white/15"
      style={{
        background: "linear-gradient(to bottom, #190D2E, #020103)",
      }}
    >
      <div className="flex flex-col justify-center items-center max-w-[95vw] mx-auto relative z-10 w-full">
        <ReusableHomeFeature
          title="Challenges"
          heading="Understanding How Different Minds Work"
          description="Many people think and process information in unique ways. Neurodivergent users, such as those with ADHD, dyslexia, or autism, often struggle with tools that expect everyone to work the same way."
          features={[
            {
              icon: <CogIcon className="w-8 h-8 text-purple-500" />,
              title: "What Usually Goes Wrong",
              description:
                "Most productivity apps are built with one kind of user in mind. They can feel too strict, too busy, or simply not flexible enough.",
            },
            {
              icon: <LightbulbIcon className="w-8 h-8 text-purple-500" />,
              title: "Why It’s a Problem",
              description:
                "When tools don’t adjust to how your brain works, tasks become harder, ideas get lost, and focus fades. That’s why we believe software should adapt to you, not the other way around.",
            },
          ]}
          rightContent={
            <div className="h-full w-full flex items-center justify-center ">
              <img
                loading="lazy"
                src={ThinkerImage}
                alt="Power Section"
                className="h-full w-full object-cover"
              />
            </div>
          }
        />
      </div>
    </div>
  );
};
