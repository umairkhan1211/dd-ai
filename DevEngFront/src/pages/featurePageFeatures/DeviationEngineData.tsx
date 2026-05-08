import { DeviationEngineSection } from "./DeviationEngineSection";
import FirstImage from "@/assets/Features/DeviationSectionImage1.png";
import SecondImage from "@/assets/Features/DeviationSectionImage2.png";
import ThirdImage from "@/assets/Features/DeviationSectionImage3.png";
// Optional: Add your image imports here
// import Image1 from "@/assets/your-path/image1.png";

export const DeviationEngineData = () => {
  return (
    <DeviationEngineSection
      heading={
        <>
          Discover the Power of the <br /> Deviation Engine for Your Mind
        </>
      }
      showLearnMore={true}
      cards={[
        {
          title: "Build, Test, and Evolve Smarter AI Systems",
          description:
            "Disruptive Duck lets you create adaptive AI characters that think, respond, and grow with your input, turning abstract intelligence into real, usable experiences.",
          imageUrl: FirstImage, // Replace with actual image path or import
        },
        {
          title: "Meet the Minds Behind Your AI Worlds",
          description:
            "Each Cast Member is a unique personality with its own memory and logic, ready to collaborate, create, or entertain. Explore and customize them to suit your creative needs.",
          imageUrl: SecondImage,
        },
        {
          title: "Shape the Future of Human AI Interaction",
          description:
            "From dialogue driven simulations to intelligent assistants, Disruptive Duck helps innovators experiment with how machines can think, learn, and evolve.",
          imageUrl: ThirdImage,
        },
      ]}
    />
  );
};
