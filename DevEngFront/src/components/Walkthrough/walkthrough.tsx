import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Joyride, { Step, CallBackProps, STATUS, EVENTS } from "react-joyride";
import { authService } from "../../services/authService";
import NewProject from "../../assets/Walkthrough/newProj.gif";
import CreateProject from "../../assets/Walkthrough/CREATE PROJ.gif";
import CreateFromTemplate from "../../assets/Walkthrough/FromTemplate.gif";
import CreateCastMember from "../../assets/Walkthrough/CustomCastmember.gif";
type Props = {
  run: boolean;
  setRun: (r: boolean) => void;
  stepIndex: number;
  setStepIndex: (i: number) => void;
};

export default function Walkthrough({
  run,
  setRun,
  stepIndex,
  setStepIndex,
}: Props) {
  const location = useLocation();
  const navigate = useNavigate();

  // Save route when in /dashboard/projects/:id
  useEffect(() => {
    if (/^\/dashboard\/projects\/[a-zA-Z0-9-]+$/.test(location.pathname)) {
      localStorage.setItem("lastProjectRoute", location.pathname);
    }
  }, [location.pathname]);

  const getStepsForPath = (pathname: string): Step[] => {
    if (stepsMap[pathname]) return stepsMap[pathname];

    if (/^\/dashboard\/projects\/[a-zA-Z0-9-]+$/.test(pathname)) {
      return stepsMap["/dashboard/projects/:id"] || [];
    }

    return [];
  };

  const stepsMap: Record<string, Step[]> = {
    "/dashboard": [
      {
        target: ".dashboard-page",
        placement: "center",

        content: (
          <div>
            <p
              className="text-primary pb-[14px] font-bold
"
            >
              Welcome! Let’s create your first project.
            </p>
            <p
              className="text-primary pb-[14px] font-bold
"
            >
              A "Project" is a chat dedicated to complete a particular task, but
              you can open projects for any other reason useful to you.
            </p>
          </div>
        ),
      },
      {
        target: ".new-project-btn",
        content: (
          <div>
            <p
              className="text-primary pb-[14px] font-bold
"
            >
              Click here to start creating a new project.
            </p>
            <img
              src={NewProject}
              alt="New project gif"
              style={{ width: "100%", borderRadius: "8px" }}
            />
          </div>
        ),
        placement: "right",
        disableBeacon: true,
        spotlightClicks: true,
        hideFooter: true,
      },
    ],
    "/dashboard/projects/new": [
      {
        target: ".tour-project-title",
        content: (
          <div>
            <p
              className="text-primary pb-[14px] font-bold
"
            >
              First, give your project a title.
            </p>
            <img
              src={CreateProject}
              alt="Project title gif"
              style={{ width: "100%", borderRadius: "8px" }}
            />
          </div>
        ),
        placement: "bottom",
        disableBeacon: true,
        spotlightClicks: true,
      },
      {
        target: ".tour-project-description",
        content: (
          <div>
            <p
              className="text-primary pb-[14px] font-bold
"
            >
              Now, describe your project here.
            </p>
            <p
              className="text-primary pb-[14px] font-bold
"
            >
              Describe your project here. Later when you are browsing your
              projects, the description will help you better identify which
              project you want to resume in the future.
            </p>
            <img
              src={CreateProject}
              alt="Project description gif"
              style={{ width: "100%", borderRadius: "8px" }}
            />
          </div>
        ),
        placement: "left",
        disableBeacon: true,
        spotlightClicks: true,
      },
      {
        target: ".CreateProjectButton",
        content: (
          <div>
            <p
              className="text-primary pb-[14px] font-bold
"
            >
              All Good
            </p>
            <p
              className="text-primary pb-[14px] font-bold
"
            >
              Click here to create the project.
            </p>
          </div>
        ),
        placement: "bottom",
        disableBeacon: true,
        hideFooter: true,
        spotlightClicks: true,
      },
    ],
    "/dashboard/projects/:id": [
      {
        target: ".CreateNewCastMemberClick",
        content: (
          <div>
            <p
              className="text-primary pb-[14px] font-bold
"
            >
              Click here - Next we can create a cast member.
            </p>
            <p
              className="text-primary pb-[14px] font-bold
"
            >
              A Cast Member is an AI construct that you build yourself. Cast
              members serve to remember responsibilities, instructions and
              specific roles relevant to your work.
            </p>
          </div>
        ),
        placement: "right",
        disableBeacon: true,
        spotlightClicks: true,
        hideFooter: true,
      },
    ],
    "/dashboard/cast-members/new": [
      {
        target: ".fromTemplete",
        content: (
          <div>
            <p
              className="text-primary pb-[14px] font-bold
"
            >
              You can create a Cast Member from Scratch or from a Template.
              Let's start by creating a cast member through a template.
            </p>
            <img
              src={CreateFromTemplate}
              alt="From template gif"
              style={{ width: "100%", borderRadius: "8px" }}
            />
          </div>
        ),
        placement: "right",
        disableBeacon: true,
      },
      {
        target: ".template-button",
        content: (
          <div>
            <p
              className="text-primary pb-[14px] font-bold
"
            >
              Dax was the first cast member, he knows the most about The
              Deviation Engine. Use his template.
            </p>
            <img
              src={CreateFromTemplate}
              alt="From template gif"
              style={{ width: "100%", borderRadius: "8px" }}
            />
          </div>
        ),
        placement: "left",
        disableBeacon: true,
      },
      //       {
      //         target: ".CustomCastMembers",
      //         content: (
      //           <div>
      //             <p
      //               className="text-primary pb-[14px] font-bold
      // "
      //             >
      //               Click here to create a custom cast member.
      //             </p>
      //             <img
      //               src={CreateCastMember}
      //               alt="Custom cast gif"
      //               style={{ width: "100%", borderRadius: "8px" }}
      //             />
      //           </div>
      //         ),
      //         placement: "right",
      //         disableBeacon: true,
      //       },
      {
        target: ".EnterInstructions",
        content: (
          <div>
            <p
              className="text-primary pb-[14px] font-bold
"
            >
              This is the instructions (external prompt). This is the practical
              and objective part of building a cast member.
            </p>
            <p
              className="text-primary pb-[14px] font-bold
"
            >
              You should write his overall responsibilities, defining actions,
              general answer structure or things he should keep in mind when
              performing his duty or interacting with you.
            </p>
          </div>
        ),
        placement: "right",
        disableBeacon: true,
        spotlightClicks: true,
      },
      {
        target: ".EnterYourDetail",
        content: (
          <div>
            <p
              className="text-primary pb-[14px] font-bold
"
            >
              This is the internal prompt. It serves to further build your
              character, but it also helps describe your character for later
              browsing. All the information goes into and affects your cast
              member, but the ones here also help describe them in the cast
              members page.
            </p>
            <p
              className="text-primary pb-[14px] font-bold
"
            >
              Name and Functional Role helps with naming and hiring your cast
              member, default tone serves to more generally apply a personality
              to the cast member.
            </p>
            <p
              className="text-primary pb-[14px] font-bold
"
            >
              The role is where you can extrapolate the reasoning behind why you
              need this character. In the role you can bestow insight to the
              character he would otherwise have to learn himself.
            </p>
          </div>
        ),
        placement: "right",
        disableBeacon: true,
        spotlightClicks: true,
      },
      {
        target: ".CreateCastMember",
        content: (
          <div className="flex flex-col space-y-3">
            <p className="text-primary pb-[14px] font-bold">
              Click here to create the character as is, or press Custom Cast
              Member to create him from scratch.
            </p>

            {/* Duplicate button from CastMemberForm */}
            <button
              className="CreateCastMember bg-primary text-white px-4 py-2 rounded-lg"
              onClick={(e) => {
                e.preventDefault();
                const form = document.querySelector("form");
                if (form) {
                  form.dispatchEvent(
                    new Event("submit", { cancelable: true, bubbles: true })
                  );
                }
              }}
            >
              Update Cast Member
            </button>
          </div>
        ),
        placement: "right",
        disableBeacon: true,
      },

      {
        target: ".clear-template",
        content: (
          <div>
            <p
              className="text-primary pb-[14px] font-bold
"
            >
              Click here to create a custom cast member.
            </p>
          </div>
        ),
        placement: "right",
        hideFooter: true,
        disableBeacon: true,
      },
      //       {
      //         target: ".EnterInstructions",
      //         content: (
      //           <div>
      //             <p
      //               className="text-primary pb-[14px] font-bold
      // "
      //             >
      //               Enter external instructions defining actions of the cast member.
      //             </p>
      //             <img
      //               src={CreateCastMember}
      //               alt="Enter instructions gif"
      //               style={{ width: "100%", borderRadius: "8px" }}
      //             />
      //           </div>
      //         ),
      //         placement: "right",
      //         disableBeacon: true,
      //         spotlightClicks: true,
      //       },
      //       {
      //         target: ".EnterYourDetail",
      //         content: (
      //           <div>
      //             <p
      //               className="text-primary pb-[14px] font-bold
      // "
      //             >
      //               Enter internal prompt, defining the personality of the cast
      //               member.
      //             </p>
      //             <img
      //               src={CreateCastMember}
      //               alt="Enter details gif"
      //               style={{ width: "100%", borderRadius: "8px" }}
      //             />
      //           </div>
      //         ),
      //         placement: "right",
      //         disableBeacon: true,
      //         spotlightClicks: true,
      //       },
      //       {
      //         target: ".CreateCastMember",
      //         content: (
      //           <div>
      //             <p
      //               className="text-primary pb-[14px] font-bold
      // "
      //             >
      //               Click here to create the cast member.
      //             </p>
      //           </div>
      //         ),
      //         placement: "right",
      //         hideFooter: true,
      //         disableBeacon: true,
      //       },
    ],

    "/dashboard/cast-members": [
      {
        target: ".CastMembers",
        placement: "center",
        content: (
          <div>
            <p className="text-primary pb-[14px] font-bold">
              Cast Member created. Now lets create a protocol.
            </p>

            <button
              style={{
                marginTop: "10px",
                backgroundColor: "hsl(var(--primary))",
                color: "#ffff",
                padding: "8px 16px",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
              onClick={() => {
                localStorage.setItem("triggerProtocolWalkthrough", "true");
                flipIsFirstLogin();
                const lastProjectRoute =
                  localStorage.getItem("lastProjectRoute");
                if (lastProjectRoute) {
                  navigate(lastProjectRoute);
                }
              }}
            >
              Go to Project
            </button>
          </div>
        ),
        disableBeacon: true,
        spotlightClicks: true,
        hideFooter: true,
      },
    ],
  };

  const steps = getStepsForPath(location.pathname);

  useEffect(() => {
    const savedRoute = localStorage.getItem("walkthroughRoute");
    const finished = localStorage.getItem("walkthroughFinished") === "true";

    if (savedRoute !== location.pathname) {
      setStepIndex(0);
      localStorage.setItem("walkthroughStepIndex", "0");
      localStorage.setItem("walkthroughRoute", location.pathname);
    }

    if (!finished && steps.length > 0) {
      const savedStep = Number(
        localStorage.getItem("walkthroughStepIndex") || 0
      );

      const checkInterval = setInterval(() => {
        if (
          steps[savedStep]?.target &&
          document.querySelector(steps[savedStep].target as string)
        ) {
          setStepIndex(savedStep);
          setRun(true);
          clearInterval(checkInterval);
        }
      }, 200);

      const timeoutId = setTimeout(() => clearInterval(checkInterval), 5000);

      return () => {
        clearInterval(checkInterval);
        clearTimeout(timeoutId);
      };
    }
  }, [location.pathname, steps, setRun, setStepIndex]);

  const handleCallback = (data: CallBackProps) => {
    const { index, status, type, action } = data;

    if (type === EVENTS.STEP_AFTER && action === "next") {
      const newIndex = index + 1;
      if (newIndex < steps.length) {
        setStepIndex(newIndex);
        localStorage.setItem("walkthroughStepIndex", String(newIndex));
      } else {
        setRun(false);
        localStorage.setItem("walkthroughFinished", "true");
        localStorage.removeItem("walkthroughStepIndex");
      }
    }

    if (type === EVENTS.STEP_AFTER && action === "prev") {
      const newIndex = index - 1 >= 0 ? index - 1 : 0;
      setStepIndex(newIndex);
      localStorage.setItem("walkthroughStepIndex", String(newIndex));
    }

    if (type === EVENTS.TOUR_STATUS && action === "close") {
      setRun(false);
      localStorage.removeItem("walkthroughStepIndex");
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      localStorage.setItem("walkthroughFinished", "true");
    }
  };

  return run ? (
    <Joyride
      steps={steps}
      disableCloseOnEsc={true}
      run={run}
      stepIndex={stepIndex}
      continuous
      showSkipButton={false}
      showProgress={
        !["/dashboard"].includes(location.pathname) // hide on /dashboard
      }
      scrollToFirstStep
      disableScrolling={false}
      hideCloseButton={true}
      disableOverlayClose={true}
      spotlightClicks={true}
      locale={{
        back: "Back",
        close: "Close",
        last: "Finish",
        next: "Next Step",
      }}
      styles={{
        options: {
          primaryColor: "#6437EC",
          zIndex: 10000,
          arrowColor: "hsl(var(--muted))",
        },
        tooltip: {
          backgroundColor: "hsl(var(--muted))", // full background
          color: "hsl(var(--muted-foreground))", // text color to match theme
          borderRadius: "0.75rem", // optional rounding
        },
        tooltipContent: {
          padding: 0, // removes padding around your p and img inside the tooltip
        },

        buttonBack: {
          color: "hsl(var(--primary))",
        },
        buttonNext: {
          backgroundColor: "hsl(var(--primary))",
          color: "#ffff",
          border: "none",
          padding: "6px 12px",
          borderRadius: "0.5rem",
          height: "40px",
          marginRight:
            location.pathname === "/dashboard"
              ? "8rem"
              : location.pathname === "/dashboard/cast-members/new"
              ? "4rem" // <-- put your different margin here
              : "0",
        },

        overlay: {
          pointerEvents: "none",
        },
        spotlight: {
          pointerEvents: "auto",
        },
      }}
      callback={handleCallback}
    />
  ) : null;
}
function flipIsFirstLogin() {
  authService.updateUser({ isFirstLogin: false });
  localStorage.removeItem("walkthroughStepIndex");
  localStorage.removeItem("walkthroughRoute");
}
