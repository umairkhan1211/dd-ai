import { ReusableHomeFeature } from "./ReusableHomeFeature";
import PowerSectionImage from "@/assets/Hero/powerSection.png";

export const PowerSection = () => {
  return (
    <div
      className="py-14 md:py-20 h-fit relative w-full border border-white/15"
      style={{
        background: "linear-gradient(to bottom, #190D2E, #020103)",
      }}
    >
      <div className="flex flex-col justify-center items-center max-w-[95vw] mx-auto relative z-10 w-full">
        <ReusableHomeFeature
          title=""
          heading="The Power Behind Disruptive Duck AI: The Deviation Engine"
          description={
            <>
              The Deviation Engine is the brain that runs Disruptive Duck AI. It
              takes your words, understands what you want to do, and helps you
              get it done, step by step.
              <br />
              You don’t need to know coding or complex tools. Just type what you
              want, like “help me plan my day” or “create a project outline,”
              and the system figures out how to make it happen.
            </>
          }
          features={[
            {
              // icon: <CogIcon className="w-8 h-8 text-purple-500" />,
              title: "Smart Understanding",
              description:
                "The engine learns from how you work, so every time you use it, it gets better at helping you.",
            },
            {
              // icon: <LightbulbIcon className="w-8 h-8 text-purple-500" />,
              title: "Smooth Experience",
              description:
                "Instead of jumping between apps or remembering commands, you can just talk to the system naturally — it handles the rest.",
            },
          ]}
          rightContent={
            <div className="h-full w-full flex items-center justify-center ">
              <img
                loading="lazy"
                src={PowerSectionImage}
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
