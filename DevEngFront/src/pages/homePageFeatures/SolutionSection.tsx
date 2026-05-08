import { CogIcon, LightbulbIcon } from "lucide-react";
import { ReusableHomeFeature } from "./ReusableHomeFeature";
import star from "@/assets/Solution/holo-star.png";
import WorkspaceImage from "@/assets/Hero/workspaceSection.png";
export const SolutionSection = () => {
  return (
    <div
      className="py-14 md:py-20 h-fit relative w-full overflow-x-hidden border border-white/15"
      style={{
        background: "linear-gradient(to bottom, #190D2E, #020103)",
      }}
    >
      <div className="flex flex-col justify-center items-center max-w-[95vw] mx-auto relative z-10 w-full">
        <ReusableHomeFeature
          heading="Your Mind  Your Workspace  Your Way"
          description={
            <>
              Disruptive Duck AI is your personal thinking assistant, a space
              where your ideas, tasks, and creative processes come together in
              one place.
              <br />
              <br />
              Instead of forcing you to fit into rigid tools, it learns how you
              think and work. Whether you like to brainstorm visually, plan step
              by step, or switch between ideas quickly, the system adapts to
              your style.
              <br />
              <br />
              Think of it as a workspace that grows smarter the more you use it.
              It helps you stay organized, remember your ideas, and turn complex
              thoughts into simple, actionable steps.
              <br />
              <br />
              With Disruptive Duck AI, your workflow finally feels natural,
              because it’s built around you.
            </>
          }
          rightContent={
            <div className="h-full w-full flex items-center justify-center ">
              <img
                loading="lazy"
                src={WorkspaceImage}
                alt="Power Section"
                className="h-full w-full object-cover"
              />
            </div>
          }
          imageSrc={star}
          imageAlt="Holographic Star"
        />
      </div>
    </div>
  );
};
