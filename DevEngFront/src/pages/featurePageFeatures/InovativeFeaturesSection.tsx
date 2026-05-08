import { DeviationEngineSection } from "./DeviationEngineSection";
import FirstImage from "@/assets/Features/InnovativeSectionImage1.png";
import SecondImage from "@/assets/Features/InnovativeSectionImage2.png";
import ThirdImage from "@/assets/Features/InnovativeSectionImage3.png";
export const InnovativeFeatureSection = () => {
    return (
<DeviationEngineSection
          heading={
            <>
              Explore Innovative Features Tailored <br />for Your Unique Cognitive Needs
            </>
          }
          showLearnMore={false}
          cards={[
            {
              title:
                "Unlock Your Potential with Our Customizable Workflow Solutions",
              description:
                "Discover how our platform supports various cognitive tasks and enhances productivity.",
              imageUrl: FirstImage, // Replace with actual path or leave undefined
            },
            {
              title: "ADHD / Neurodivergent Support for Enhanced Focus and Clarity",
              description:
                "Tailored tools designed to help you manage distractions and boost concentration.",
              imageUrl: SecondImage,
            },
            {
              title:
                "Creative Work: Fuel Your Imagination with Intelligent Assistance",
              description:
                "The Deviation Engine transforms abstract logic into practical, usable systems for everyone.",
              imageUrl: ThirdImage, // Replace with actual path or leave undefined
            },
          ]}
        />
    );
}