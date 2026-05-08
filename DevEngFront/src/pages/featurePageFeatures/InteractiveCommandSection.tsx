import { DeviationEngineSection } from "./DeviationEngineSection";
export const InteractiveCommandSection= () => {
    return (
<DeviationEngineSection
title="Commands"
          heading={
            <>
              Explore Our Interactive<br />Command Features
            </>
          }
          showLearnMore={true}
          cards={[
            {
              title:
                "Unlock Your Potential with Our Customizable Workflow Solutions",
              description:
                "Discover how our platform supports various cognitive tasks and enhances productivity.",
              imageUrl: "", // Replace with actual path or leave undefined
            },
            {
              title: "ADHD / Neurodivergent Support for Enhanced Focus and Clarity",
              description:
                "Tailored tools designed to help you manage distractions and boost concentration.",
              imageUrl: "",
            },
            {
              title:
                "Creative Work: Fuel Your Imagination with Intelligent Assistance",
              description:
                "The Deviation Engine transforms abstract logic into practical, usable systems for everyone.",
              imageUrl: "",
            },
          ]}
        />
    );
}