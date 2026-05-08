import { motion } from "framer-motion";
import Doughnut from "@/assets/AboutUs/doughnut.png";
import FirstPersonImage from "@/assets/Hero/female1.png";
import SecondPersonImage from "@/assets/Hero/man4.png";
import ThirdPersonImage from "@/assets/Hero/man2.png";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
export const DiscoverPersonas = () => {
  return (
    <div
      className="py-14 md:py-20 h-fit relative w-full border border-white/15 overflow-visible"
      style={{
        background: "linear-gradient(to bottom, #190D2E, #020103)",
      }}
    >
      <div className="flex flex-col justify-center items-center w-full max-w-[95vw] px-4 mx-auto relative z-10 mb-12">
        {/* Heading and Paragraph */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mb-12 md:mb-16 w-full flex flex-col items-center font-roboto"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.8 }}
            className="flex flex-col md:flex-col justify-center w-full gap-8 text-[#FFFFFF]"
          >
            <h2 className="font-bold text-[40px] md:text-[56px] leading-tight text-center text-white max-w-3xl flex justify-center self-center">
              Discover Your DDAI Personas
            </h2>
            <p className="text-base md:text-xl max-w-2xl  text-center self-center ">
              Each DDAI persona is designed to enhance your productivity by
              aligning with your unique thinking style. Explore the distinct
              capabilities of our intelligent assistants tailored for your
              needs.
            </p>
          </motion.div>
        </motion.div>

        {/* Cards */}
        <motion.div
          className="flex flex-wrap justify-center items-center gap-8 my-12 w-full"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="relative w-[280px] h-[340px] sm:w-[300px] sm:h-[360px] lg:w-[340px] lg:h-[400px] xl:w-[380px] xl:h-[440px] rounded-2xl overflow-hidden shadow-[0px_4px_31.7px_52px_rgba(0,0,0,0.2)]">
            <img
            loading="lazy"
              src={FirstPersonImage}
              alt="Leo"
              className="w-full h-auto object-cover aspect-square"
            />

            {/* Overlay content */}
            <div className="absolute bottom-0 left-0 w-full bg-[linear-gradient(103.38deg,_#5243C2_7.12%,_#27205C_104.54%)] p-3 text-white font-roboto ">
              <h3 className="text-2xl font-bold">Merry</h3>
              <p className="text-base opacity-90 mt-2">
                Linguistics & Narrative Specialist
              </p>
              <br />
              <p className="text-base opacity-80 mt-3 text-center">
                Clear, Constructive
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="relative w-[300px] h-[360px] sm:w-[340px] sm:h-[400px] lg:w-[380px] lg:h-[440px] xl:w-[420px] xl:h-[480px] rounded-2xl overflow-hidden shadow-[0px_4px_31.7px_52px_rgba(0,0,0,0.2)]">
            <img
              loading="lazy"
              src={SecondPersonImage}
              alt="Dax"
              className="w-full h-auto object-cover aspect-square"
            />
            <div className="absolute bottom-0 left-0 w-full h-[150px] sm:h-[170px] md:h-[190px] bg-[linear-gradient(103.38deg,_#5243C2_7.12%,_#27205C_104.54%)] p-3 text-white font-roboto">
              <h3 className="text-3xl font-bold">Dax</h3>
              <p className="text-xl opacity-90 mt-3">
                Logic Strategist & Coordinator
              </p>
              <br />
              
           <p className="text-xl opacity-80 mt-0 md:mt-4 text-center">
                             Precise, Direct
                    </p>

            </div>
          </div>

          {/* Card 3 */}
          <div className="relative w-[280px] h-[340px] sm:w-[300px] sm:h-[360px] lg:w-[340px] lg:h-[400px] xl:w-[380px] xl:h-[440px] rounded-2xl overflow-hidden shadow-[0px_4px_31.7px_52px_rgba(0,0,0,0.2)]">
            <img
              loading="lazy"
              src={ThirdPersonImage}
              alt="Hollis"
              className="w-full h-auto object-cover aspect-square"
            />
            <div className="absolute bottom-0 left-0 w-full bg-[linear-gradient(103.38deg,_#5243C2_7.12%,_#27205C_104.54%)] p-3 text-white font-roboto">
              <h3 className="text-2xl font-bold">Hollis</h3>
              <p className="text-base opacity-90 mt-1">
                Discipline & Productivity Enforcer
              </p>
              <br />
              <p className="text-base opacity-80 mt-3 text-center">
                Stern, Fair
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      <div className="absolute bottom-0 right-[-100px] top-[47.25rem] z-0 pointer-events-none ">
        <img
          loading="lazy"
          src={Doughnut}
          alt="Doughnut Background"
          className="w-[200px] md:w-[250px] lg:w-[300px] max-sm:hidden  "
        />
      </div>
    </div>
  );
};
