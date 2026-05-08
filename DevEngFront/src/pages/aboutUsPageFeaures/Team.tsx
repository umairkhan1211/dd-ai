import { motion } from "framer-motion";
import infyntrixlogo from "@/assets/Hero/infyntrixlogo.png";
import ducklogo  from "@/assets/login/mainLogo.png";

/**
 * "Meet the Team" section — fully animated & responsive.
 *
 * – Uses a framer‑motion container/item pattern for staggered entrance.
 * – Three team‑member cards (placeholder + Artur).
 * – Abstract blob graphic in the top‑left corner (matches visual in screenshot).
 */
export const OurTeam = () => {
  // Animation variants
  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.2, // 0.2‑second delay between children
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  // Data for each team member (can be replaced dynamically later)
  const team = [
    // {
    //   name: "Team Sami",
    //   role: "Marketing and Growth",
    //   desc: "A dedicated external collaborator oversees outreach, SEO, and user scaling—helping the right minds find the right system.",
    //   image:
    //     "",
    // },
    {
      name: 'Duck',
      role: "Founder & System Architect",
      desc: "Duck is a Business Management graduate and IB Diploma holder from the UK. After pursuing postgraduate studies in Data Science, he founded Disruptive Duck, developing modular AI productivity systems. Diagnosed with Asperger’s in his mid-twenties, he transformed his approach to focus and creativity, fueling his mission to build tools that empower “exotic minds.” With 3 years in full-stack development and experience in sales and management, Duck blends business insight and technical expertise to design adaptive, human-centered AI systems.",
      image: ducklogo,
    },
    {
      name: "Team Infyntrix",
      role: "Lead Developement",
      desc: "Infyntrix Solutions served as the lead development partner behind the Disruptive Duck platform. Specializing in full-stack web and AI-driven solutions, Infyntrix transformed conceptual frameworks into a robust and scalable product experience. Their team handled the complete development lifecycle, from backend architecture and API integrations to UI/UX design and deployment, ensuring seamless performance, reliability, and future-ready scalability. With a focus on innovation and technical precision, Infyntrix Solutions brought Duck’s vision of modular AI productivity systems to life.",
      image: infyntrixlogo,
    },
  ];

  return (
    <div className="relative w-full bg-[#F5F5FA] py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-8 overflow-visible z-40">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="mx-auto max-w-[100%]"
      >
        {/* Heading */}
        <motion.h1
          variants={item}
          className="text-[28px] sm:text-[36px] md:text-[44px] lg:text-[48px] leading-[120%] font-bold text-center font-roboto mb-12 sm:mb-16 text-black"
        >
          Meet the Team
        </motion.h1>

        {/* Team grid */}
        <div className="flex flex-wrap justify-center items-start w-full gap-10 sm:gap-12 md:gap-10">
          {team.map((member, i) => (
            <motion.div
              key={i}
              variants={item}
              className={`
        flex flex-col items-center text-center
        px-4 sm:px-6 md:px-8
        w-full sm:w-[80%] md:w-[45%] lg:w-[30%] xl:w-[25%]
        transition-all duration-300
      `}
            >
              {/* Avatar */}
              <div className="mb-6  w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 rounded-full overflow-hidden ">
                <img
                  loading="lazy"
                  src={member.image}
                  className="object-contain w-full h-full aspect-square"
                />
              </div>

              {/* Name, Role, Description */}
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold font-roboto mb-2 text-black">
                {member.name}
              </h3>
              <p className="text-sm sm:text-base md:text-lg italic font-semibold mb-4 text-black/80">
                {member.role}
              </p>
              <p
                className="
          text-sm sm:text-base md:text-lg leading-relaxed text-black/80
          max-w-[350px] sm:max-w-[450px] md:max-w-[550px] lg:max-w-[600px]
        "
              >
                {member.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </motion.div>
    </div>
  );
};
