import Joyride, { Step, CallBackProps, STATUS } from "react-joyride";
import Level1GIF from "../../assets/Walkthrough/LEVEL 1.gif";
import Level1PromptTemplate from "../../assets/Walkthrough/Level1Prompt.png";
import Level1BasicInfo from "../../assets/Walkthrough/Level1BasicInfo.png";
import Level2GIF from "../../assets/Walkthrough/LEVEL 2.gif";
import Level2Inputs from "../../assets/Walkthrough/inputLevel2.png";
import Level2PromptTemplate from "../../assets/Walkthrough/promptTempLevel2.png";
import Level2BasicInfo from "../../assets/Walkthrough/Level2BasicInfo.png";
import Level3Advanced from "../../assets/Walkthrough/Level3Advanced.png";
import Level3GIF from "../../assets/Walkthrough/LEVEL 3.gif";
import Welcome from "../../assets/Walkthrough/Welcome.gif";

type Props = {
  run: boolean;
  setRun: (r: boolean) => void;
  userType: string | null;
  onFinish: () => void;
};

export default function ProtocolWalkthrough({
  run,
  setRun,
  userType,
  onFinish,
}: Props) {
  // --- ALL STEPS BANAYE ---
  const allSteps: Step[] = [
    // Universal Welcome Step
    {
      target: "body",
      placement: "center",
      content: (
        <div key="welcome-step" className="w-full h-full flex flex-col">
          <div className="flex justify-center mb-6">
            <img
              src={Welcome}
              alt="Walkthrough demo"
              className="rounded-lg max-h-[350px] w-3/4 object-cover"
            />
          </div>
          <div className="flex-1 overflow-y-auto px-8">
            <div className="bg-primary/5 text-[#94A3B8] p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Welcome! 👋</h2>
              <ul
                className="list-inside text-center space-y-2 text-lg list-none
"
              >
                <li>
                  This walkthrough will guide you through creating your first
                  protocol.
                </li>
                <li>
                  When you build a prompt you use tokens, the better the prompt
                  you build the more effective the answer. DDAI invented the
                  concept of protocols, repeatable prompts, with various
                  features, that allow you to automate your workflow and make
                  your job easier.
                </li>
                <li>
                  In this tutorial, we will show you how you can build protocols
                  specifically for your own needs and work.
                </li>
                <li>
                  Follow the steps carefully and click <b>Next</b> to get
                  started.
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
      disableBeacon: true,
    },

    // ------- Level 1 Steps ---------
    {
      target: "body",
      placement: "center",
      content: (
        <div key="step1" className="w-full h-full flex flex-col">
          <div className="flex justify-center mb-6">
            <img
              src={Level1GIF}
              alt="Walkthrough demo"
              className="rounded-lg max-h-[350px] w-3/4 object-cover"
            />
          </div>
          <div className="flex-1 overflow-y-auto px-8">
            <div className="bg-primary/5 text-[#94A3B8] p-6 rounded-lg shadow-lg">
              {/* <h2 className="text-2xl font-bold mb-4">Welcome! 👋</h2> */}
              <ul className="list-none list-inside space-y-2 text-center text-lg">
                <li>
                  This walkthrough will guide you to create your first protocol.
                </li>
                <li>
                  Follow the steps carefully to understand how Level 1 protocols
                  work.
                </li>
                <li>
                  Click <b>Next</b> to proceed to the instructions section.
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: "body",
      placement: "center",
      content: (
        <div key="step2" className="w-full h-full flex flex-col">
          <div className="flex justify-center mb-6">
            <img
              src={Level1PromptTemplate}
              alt="Walkthrough demo"
              className="rounded-lg max-h-[350px] w-3/4 object-cover"
            />
          </div>
          <div className="flex-1 overflow-y-auto px-8">
            <div className="bg-primary/5 text-[#94A3B8] p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Prompt Template</h2>
              <ul className="list-none list-inside space-y-2 text-center text-lg">
                <li>
                  Level 1 protocols are simple. You type in the prompt you want,
                  you press create, and a button is created for you with what
                  you prompted.
                </li>
                <li>
                  Every time you press a level 1 protocol, the exact prompt you
                  originally created will be sent to the LLM, and it will do so
                  every time you press that button.
                </li>

                <li>
                  Click <b>Next</b> to learn about Basic Information.
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: "body",
      placement: "center",
      content: (
        <div key="step3" className="w-full h-full flex flex-col">
          <div className="flex justify-center mb-6">
            <img
              src={Level1BasicInfo}
              alt="Walkthrough demo"
              className="rounded-lg max-h-[350px] w-3/4 object-cover"
            />
          </div>
          <div className="flex-1 overflow-y-auto px-8">
            <div className="bg-primary/5 text-[#94A3B8] p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Basic Information</h2>
              <ul className="list-none list-inside space-y-2 text-left text-lg">
                <li>
                  Basic Information serves to better describe and organize the
                  protocol for later browsing.
                </li>
                <li>
                  <b>Name:</b> Give your protocol a short, clear name.
                </li>
                <li>
                  <b>Category:</b> Select the category that best fits.
                </li>
                <li>
                  <b>Description:</b> Describe what this protocol does.
                </li>
                <li>
                  <b>AI Agent:</b> Choose which AI agent should run this
                  protocol.
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
      disableBeacon: true,
    },

    // ------- Level 2 Steps ---------
    {
      target: "body",
      placement: "center",
      content: (
        <div key="step4" className="w-full h-full flex flex-col">
          <div className="flex justify-center mb-6">
            <img
              src={Level2GIF}
              alt="Walkthrough demo"
              className="rounded-lg max-h-[350px] w-3/4 object-cover"
            />
          </div>
          <div className="flex-1 overflow-y-auto px-8">
            <div className="bg-primary/5 text-[#94A3B8] p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Welcome to Level 2 👋</h2>
              <ul className="list-none list-inside space-y-2 text-center text-lg">
                <li>
                  Level 2 protocols allow placeholders and interactive inputs.
                </li>
                <li>
                  Level 2 Protocols differ from Level 1, in the sense that it
                  can take 1 or more inputs.
                </li>
                <li>
                  Click <b>Next</b> to learn how to add input fields and set up
                  your prompt template.
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: "body",
      placement: "center",
      content: (
        <div key="step5" className="w-full h-full flex flex-col">
          <div className="flex justify-center mb-6">
            <img
              src={Level2Inputs}
              alt="Walkthrough demo"
              className="rounded-lg max-h-[350px] w-3/4 object-cover"
            />
          </div>
          <div className="flex-1 overflow-y-auto px-8">
            <div className="bg-primary/5 text-[#94A3B8] p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Input Fields</h2>
              <ul className="list-none list-inside space-y-2 text-center text-lg">
                <li>
                  To not over-complicate, you can set it so that whenever you
                  press a level 2 protocol button, it will ask you for inputs
                  before executing on the prompt you created for it.
                </li>
                <li>
                  Example: Summarize Protocol - Take an input, then summarize
                  it.
                </li>
                <li>
                  When you click the summarize protocol, it will ask you for the
                  text input for it to summarize before executing on the
                  instructions you give it.
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: "body",
      placement: "center",
      content: (
        <div key="step6" className="w-full h-full flex flex-col">
          <div className="flex justify-center mb-6">
            <img
              src={Level2PromptTemplate}
              alt="Walkthrough demo"
              className="rounded-lg max-h-[350px] w-3/4 object-cover"
            />
          </div>
          <div className="flex-1 overflow-y-auto px-8">
            <div className="bg-primary/5 text-[#94A3B8] p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Prompt Template</h2>
              <ul className="list-disc list-inside space-y-2 text-left text-lg">
                <li>
                  The concept is simple, but new, so it might sound a little
                  convoluted in description but its very simple in practice.
                </li>
                <li>Use the input names you created in the previous step.</li>
                <li>
                  Just click on an input field name above to insert it into your
                  template.
                </li>
                <li>
                  Click <b>Next</b> to learn about Basic Information.
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
      disableBeacon: true,
    },
    // {
    //   target: "body",
    //   placement: "center",
    //   content: (
    //     <div key="step7" className="w-full h-full flex flex-col">
    //       <div className="flex justify-center mb-6">
    //         <img
    //           src={Level2BasicInfo}
    //           alt="Walkthrough demo"
    //           className="rounded-lg max-h-[350px] w-3/4 object-cover"
    //         />
    //       </div>
    //       <div className="flex-1 overflow-y-auto px-8">
    //         <div className="bg-primary/5 text-[#94A3B8] p-6 rounded-lg shadow-lg">
    //           <h2 className="text-2xl font-bold mb-4">Basic Information</h2>
    //           <ul className="list-none list-inside space-y-2 text-left text-lg">
    //             <li>
    //               <b>Name:</b> Short and clear identifier.
    //             </li>
    //             <li>
    //               <b>Category:</b> Most relevant category.
    //             </li>
    //             <li>
    //               <b>Description:</b> Explain purpose of the protocol.
    //             </li>
    //             <li>
    //               <b>AI Agent:</b> Assign or leave blank.
    //             </li>
    //           </ul>
    //         </div>
    //       </div>
    //     </div>
    //   ),
    //   disableBeacon: true,
    // },

    // ------- Level 3 Steps ---------
    {
      target: "body",
      placement: "center",
      content: (
        <div key="step8" className="w-full h-full flex flex-col">
          <div className="flex justify-center mb-6">
            <img
              src={Level3GIF}
              alt="Walkthrough demo"
              className="rounded-lg max-h-[350px] w-3/4 object-cover"
            />
          </div>
          <div className="flex-1 overflow-y-auto px-8">
            <div className="bg-primary/5 text-[#94A3B8] p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Welcome to Level 3 🚀</h2>
              <ul className="list-none list-inside space-y-2 text-center text-lg">
                <li>
                  Lastly we have level 3 protocols. L3 Protocols are the same as
                  Level 2 protocols, however they allow for the features of
                  iterative looping and protocol-chaining.
                </li>
                <li>
                  Click <b>Next</b> to learn more.
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
      disableBeacon: true,
    },
    // {
    //   target: "body",
    //   placement: "center",
    //   content: (
    //     <div key="step9" className="w-full h-full flex flex-col">
    //       <div className="flex justify-center mb-6">
    //         <img
    //           src={Level2Inputs}
    //           alt="Walkthrough demo"
    //           className="rounded-lg max-h-[350px] w-3/4 object-cover"
    //         />
    //       </div>
    //       <div className="flex-1 overflow-y-auto px-8">
    //         <div className="bg-primary/5 text-[#94A3B8] p-6 rounded-lg shadow-lg">
    //           <h2 className="text-2xl font-bold mb-4">Input Fields</h2>
    //           <ul className="list-none list-inside space-y-2 text-left text-lg">
    //             <li>
    //               <b>Name:</b> Unique identifier for placeholder.
    //             </li>
    //             <li>
    //               <b>Label:</b> Display name in the form.
    //             </li>
    //             <li>
    //               <b>Type:</b> Text, Select, Number, Boolean.
    //             </li>
    //             <li>
    //               <b>Placeholder:</b> Guidance text.
    //             </li>
    //           </ul>
    //         </div>
    //       </div>
    //     </div>
    //   ),
    //   disableBeacon: true,
    // },
    // {
    //   target: "body",
    //   placement: "center",
    //   content: (
    //     <div key="step10" className="w-full h-full flex flex-col">
    //       <div className="flex justify-center mb-6">
    //         <img
    //           src={Level2PromptTemplate}
    //           alt="Walkthrough demo"
    //           className="rounded-lg max-h-[350px] w-3/4 object-cover"
    //         />
    //       </div>
    //       <div className="flex-1 overflow-y-auto px-8">
    //         <div className="bg-primary/5 text-[#94A3B8] p-6 rounded-lg shadow-lg">
    //           <h2 className="text-2xl font-bold mb-4">Prompt Template</h2>
    //           <ul className="list-disc list-inside space-y-2 text-left text-lg">
    //             <li>Use the input names you created in the previous step.</li>
    //             <li>
    //               Just click on an input field name above to insert it into your
    //               template.
    //             </li>
    //             <li>
    //               Click <b>Next</b> to learn about Basic Information.
    //             </li>
    //           </ul>
    //         </div>
    //       </div>
    //     </div>
    //   ),
    //   disableBeacon: true,
    // },
    // {
    //   target: "body",
    //   placement: "center",
    //   content: (
    //     <div key="step11" className="w-full h-full flex flex-col">
    //       <div className="flex justify-center mb-6">
    //         <img
    //           src={Level2BasicInfo}
    //           alt="Walkthrough demo"
    //           className="rounded-lg max-h-[350px] w-3/4 object-cover"
    //         />
    //       </div>
    //       <div className="flex-1 overflow-y-auto px-8">
    //         <div className="bg-primary/5 text-[#94A3B8] p-6 rounded-lg shadow-lg">
    //           <h2 className="text-2xl font-bold mb-4">Basic Information</h2>
    //           <ul className="list-none list-inside space-y-2 text-left text-lg">
    //             <li>
    //               <b>Name:</b> A short title so you can recognize this protocol
    //               later.
    //             </li>
    //             <li>
    //               <b>Category:</b> Choose the category that fits best.
    //             </li>
    //             <li>
    //               <b>Description:</b> A quick summary of what this protocol is
    //               for.
    //             </li>
    //             <li>
    //               <b>AI Agent:</b> Pick an agent to run it (or leave it blank if
    //               not needed).
    //             </li>
    //           </ul>
    //         </div>
    //       </div>
    //     </div>
    //   ),
    //   disableBeacon: true,
    // },
    {
      target: "body",
      placement: "center",
      content: (
        <div key="step12" className="w-full h-full flex flex-col">
          <div className="flex justify-center mb-6">
            <img
              src={Level3Advanced}
              alt="Walkthrough demo"
              className="rounded-lg max-h-[350px] w-3/4 object-cover"
            />
          </div>
          <div className="flex-1 overflow-y-auto px-8">
            <div className="bg-primary/5 text-[#94A3B8] p-6 rounded-lg shadow-lg ">
              <h2 className="text-2xl font-bold mb-4">Advanced Logic</h2>
              <ul className="list-none list-inside space-y-2 text-center text-lg">
                <li>
                  Iteration or iterative looping is a feature that asks the LLMs
                  to perform instructions over each loop, you can repeat those
                  instructions for each loop, or provide specific instructions
                  for each step.
                </li>
                <li>
                  The Step Chaining allow you to "chain" protocols, having one
                  protocol be activated at each different step of your workflow.
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: "body",
      placement: "center",
      content: (
        <div
          key="step13"
          className="flex flex-col justify-center items-center text-center text-white w-full h-full"
        >
          <h1 className="text-3xl font-bold mb-4 pt-[200px]">
            Thank you for completing the walkthrough!
          </h1>

          <h3 className="text-xl">Let’s create your first protocol.</h3>
        </div>
      ),
      disableBeacon: true,

      styles: {
        tooltip: {
          background: "linear-gradient(135deg, #1E1F42 0%, #0E0F24 100%)",
          borderRadius: "1rem",
          minWidth: "1000px",
          maxWidth: "1200px",
          minHeight: "600px",
          padding: "30px",

          // 👇 Force tooltip into full-height flexbox
          display: "flex",
          flexDirection: "column",
          height: "100%",
        },
        tooltipContent: {
          flex: 1, // expand
          display: "flex",
          alignItems: "center", // vertical center
          justifyContent: "center", // horizontal center
          textAlign: "center",
          width: "100%",
          height: "100%", // 👈 force full height
        },
        tooltipFooter: {
          marginTop: "auto", // push to bottom
          textAlign: "center",
        },
        buttonBack: {
          color: "rgba(255,255,255,0.85)",
        },
      },
    },
  ];

  // --- FILTER USER TYPE ---
  let steps: Step[] = [];
  if (userType === "trial") {
    // Universal (0) + Level 1 (1-3) + Last Thank You (12)
    steps = allSteps.filter(
      (_, idx) => idx <= 3 || idx === allSteps.length - 1
    );
  } else {
    steps = allSteps; // sab steps
  }

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      onFinish();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      disableCloseOnEsc
      disableOverlayClose
      hideCloseButton
      scrollToFirstStep
      spotlightClicks={false}
      locale={{
        back: "Back",
        close: "Close",
        last: "Finish",
        next: "Next Step",
      }}
      styles={{
        options: {
          primaryColor: "#6437EC",
          zIndex: 20000,
          arrowColor: "hsl(var(--muted))",
        },
        tooltip: {
          background: "linear-gradient(135deg, #1E1F42 0%, #0E0F24 100%)",
          color: "hsl(var(--muted-foreground))",
          borderRadius: "1rem",
          minWidth: "1000px",
          maxWidth: "1200px",
          minHeight: "600px",
          padding: "30px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        },
        tooltipContent: {
          padding: 0,
          width: "100%",
          height: "100%",
        },
        tooltipFooter: {
          display: "block",
          //   justifyContent: "center !important", // 👈 buttons center ho jayenge
          //   gap: "10px",
          textAlign: "center",
        },
        buttonBack: {
          color: "hsl(var(--primary))",
        },
        buttonNext: {
          backgroundColor: "hsl(var(--primary))",
          color: "#fff",
          border: "none",
          padding: "10px 20px",
          borderRadius: "0.5rem",
          height: "46px",
          fontSize: "16px",
        },
        overlay: {
          pointerEvents: "auto",
          backgroundColor: "rgba(0,0,0,0.6)",
        },
        spotlight: {
          pointerEvents: "none",
        },
      }}
      callback={handleJoyrideCallback}
    />
  );
}
