import { PowerSectionData } from "./PowerSectionData";
import PowerSectionImage from "@/assets/Features/PowerSectionImage.png";
export const PowerSection = () => {
  return (
    <div
      className="py-14 md:py-20 h-fit relative w-full border border-white/15"
      style={{
        background: "linear-gradient(to bottom, #190D2E, #020103)",
      }}
    >
      <div className="flex flex-col justify-center items-center max-w-[95vw] mx-auto relative z-10 w-full">
        <PowerSectionData
          title="Interact"
          heading="Turn your thoughts into actions instantly"
          description={
            <>
              Type a command, ask a question, or describe what you need, and
              watch the system respond in real time.
              <br />
              Deviation is built to understand you, adapt to your workflow, and
              help you move ideas forward without friction.
            </>
          }
          features={[
            {
              title: "Try It Yourself",
              description: (
                <>
                  Experiment with simple commands to see how the system helps
                  you organize, create, and think more clearly.
                  <br />
                  Every response teaches you how to build smarter and faster
                  with your own AI workspace.
                </>
              ),
            },
            {
              title: "Get Started",
              description: (
                <>
                  Begin your journey with easy-to-use tools that support you
                  from your first idea to your finished project.
                  <br />
                  No setup needed, no coding required. Just start typing and see
                  the results.
                </>
              ),
            },
          ]}
          rightContent={
            <div className="h-full w-full flex items-center justify-center ">
              <img
                loading="lazy"
                src={PowerSectionImage}
                alt="Third Persona"
                className="w-full h-full object-cover"
              />
            </div>
          }
        />
      </div>
    </div>
  );
};
