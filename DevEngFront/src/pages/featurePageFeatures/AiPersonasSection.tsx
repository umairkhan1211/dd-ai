import { motion } from "framer-motion";
import FirstPerson from "@/assets/Hero/man3.png";
import SecondPerson from "@/assets/Hero/man2.png";
import ThirdPerson from "@/assets/Hero/female1.png";
import FourthPerson from "@/assets/Hero/man1.png";
import FifthPerson from "@/assets/Hero/man5.png";

export function AIPersonasSection() {
  const overlayClass =
    "absolute bottom-0 left-0 w-full bg-[linear-gradient(103.38deg,_#5243C2_7.12%,_#27205C_104.54%)] text-white font-roboto p-3";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      viewport={{ once: true, amount: 0.3 }}
      className="py-14 md:py-20 px-4 sm:px-10 md:px-20 w-full border border-white/15 bg-gradient-to-b from-[#190D2E] to-[#020103]"
    >
      {/* Section Heading */}
      <div className="text-center mb-12">
        <h2 className="font-roboto font-bold text-3xl sm:text-4xl text-white mb-2">
          AI Personas
        </h2>
        <p className="text-[#E1E1E1] text-sm sm:text-base">
          Meet our intelligent AI personalities ready to assist you.
        </p>
      </div>

      {/* Layout for all screens */}
      <motion.div
        className="md:flex md:flex-row gap-6 max-w-[97%] mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.2,
            },
          },
        }}
      >
        {/* --- 💻 Desktop Layout --- */}
        <div className="hidden md:flex w-full gap-6">
          {/* Card 1 (Large: Dax) */}
          <motion.div
            className="relative rounded-[20px] w-[45%] aspect-[3/2] overflow-hidden"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
            }}
          >
            <img
            loading="lazy"
              src={FirstPerson}
              alt="Dax"
              className="w-full h-auto object-fit"
            />
            <div className={`${overlayClass} h-[130px] rounded-b-[20px]`}>
              <h3 className="text-3xl font-bold">Dax</h3>
              <p className="text-2xl opacity-90">
                Logic Strategist & Coordinator
              </p>
              <p className="text-2xl mt-1  sm:text-base">
                Core processing, Structure, protocol logic
              </p>
            </div>
          </motion.div>

          {/* Right side: 4 small cards */}
          <div className="w-[55%] grid grid-cols-2 gap-4">
            {[
              {
                img: SecondPerson,
                name: "Hollis",
                role: "Discipline & Productivity Enforcer",
                desc: "Execution Pressure, reminders, Prioritization",
              },
              {
                img: ThirdPerson,
                name: "Merry",
                role: "Hidden Strategist",
                desc: "Critical thinking, alternate Pathways",
              },
              {
                img: FourthPerson,
                name: "Dan",
                role: "Linguistics & Narrative Specialist",
                desc: "Refines Language, Improves Clarity",
              },
              {
                img: FifthPerson,
                name: "Mike",
                role: "Value Strategist",
                desc: "Assesses usefulness & reader relevance",
              },
            ].map((p, i) => (
              <motion.div
                key={i}
                className="relative rounded-[20px] aspect-[4/3] overflow-hidden"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, delay: i * 0.1 },
                  },
                }}
              >
                <img
                loading="lazy"
                  src={p.img}
                  alt={p.name}
                  className="w-full h-auto object-fit"
                />
                <div className={`${overlayClass} h-[85px] rounded-b-[20px] p-2`}>
                  <h3 className="text-xl font-bold">{p.name}</h3>
                  <p className="text-sm">{p.role}</p>
                  <p className="text-xs mt-1 opacity-90">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* --- 📱 Mobile Layout --- */}
        <div className="flex flex-col gap-4 md:hidden">
          {/* Top Row */}
          <div className="flex gap-4">
            {/* Dax Card */}
            <motion.div
              className="relative rounded-[20px] w-1/2 aspect-[3/2] overflow-hidden"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6, delay: 0.1 },
                },
              }}
            >
              <img
              loading="lazy"
                src={FirstPerson}
                alt="Dax"
                className="w-full h-full object-cover"
              />
              <div className={`${overlayClass} h-[80px] rounded-b-[20px]`}>
                <h3 className="text-xs font-bold">Dax</h3>
                <p className="text-[10px]">Logic Strategist & Coordinator</p>
                <p className="text-[10px] mt-1 opacity-90">
                  Core processing, Structure, protocol logic
                </p>
              </div>
            </motion.div>

            {/* Hollis & Dan */}
            <div className="flex flex-col gap-4 w-1/2">
              {[SecondPerson, ThirdPerson].map((img, i) => {
                const names = ["Hollis", "Dan"];
                const roles = [
                  "Discipline & Productivity Enforcer",
                  "Hidden Strategist",
                ];
                const descs = [
                  "Execution Pressure, reminders, Prioritization",
                  "Critical thinking, alternate Pathways",
                ];
                return (
                  <motion.div
                    key={i}
                    className="relative rounded-[20px] aspect-[4/3] w-full overflow-hidden"
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: {
                          duration: 0.6,
                          delay: (i + 2) * 0.1,
                        },
                      },
                    }}
                  >
                    <img
                    loading="lazy"
                      src={img}
                      alt={names[i]}
                      className="w-full h-auto object-fit"
                    />
                    <div className="absolute bottom-0 left-0 w-full bg-[linear-gradient(103.38deg,_#5243C2_7.12%,_#27205C_104.54%)] text-white font-roboto  h-[45px] rounded-b-[20px] pl-2 pt-1">
                      <h3 className="text-xs font-bold">{names[i]}</h3>
                      <p className="text-[7px]">{roles[i]}</p>
                      <p className="text-[7px] opacity-90">{descs[i]}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Bottom row: Leo & Clara */}
          <div className="flex gap-4">
            {[FourthPerson, FifthPerson].map((img, i) => {
              const names = ["Leo", "Clara"];
              const roles = [
                "Linguistics & Narrative Specialist",
                "Value Strategist",
              ];
              const descs = [
                "Refines Language, Improves Clarity",
                "Assesses usefulness & reader relevance",
              ];
              return (
                <motion.div
                  key={i}
                  className="relative rounded-[20px] aspect-[4/3] w-1/2 overflow-hidden"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: 0.6,
                        delay: (i + 4) * 0.1,
                      },
                    },
                  }}
                >
                  <img
                  loading="lazy"
                    src={img}
                    alt={names[i]}
                    className="w-full h-auto object-fit"
                  />
                  <div className="absolute bottom-0 left-0 w-full bg-[linear-gradient(103.38deg,_#5243C2_7.12%,_#27205C_104.54%)] text-white font-roboto  h-[45px] rounded-b-[20px] pl-2 pt-1">
                    <h3 className="text-xs font-bold">{names[i]}</h3>
                    <p className="text-[7px]">{roles[i]}</p>
                    <p className="text-[7px] opacity-90">{descs[i]}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
