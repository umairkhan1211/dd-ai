import { motion } from "framer-motion";
import { LucideSearch, LucideCompass, ArrowRightFromLine } from "lucide-react";
import searchImage from "@/assets/NaturtalLanguage/search.png"

export const NaturalLanguage = () => {
    return (
        <section
            className="w-full py-16 md:py-24 px-4 bg-gradient-to-b from-[#1A0D2F] to-[#020103] text-white h-fit"
        >
            <div className="flex flex-col max-w-7xl mx-auto text-center justify-center items-center gap-14 font-roboto">
                {/* Heading */}
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="text-2xl sm:text-3xl md:text-[40px] font-bold mb-12 max-w-4xl mx-auto leading-[120%] font-Roboto"
                >
                    Unlock the Power of Natural Language <br />
                    with Disruptive Duck AI Protocols
                </motion.h2>

                {/* Features Grid */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-14 text-left max-w-7xl mt-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                >
                    {/* Item 1 */}
                    <div className="flex flex-col items-center text-center px-4 gap-2">
                        <img loading="lazy" src={searchImage} alt="Search Icon" className="mb-6 w-16 h-16" />
                        <h3 className="text-lg font-bold mb-2 text-[#FFFFFF]">
                            Transform Commands into <br /> Actions Effortlessly with DDAI
                        </h3>
                        <p className="text-base font-normal text-[#FFFFFF] max-w-xs">
                            Explore how simple phrases can trigger powerful responses in your AI.
                        </p>
                    </div>

                    {/* Item 2 */}
                    <div className="flex flex-col items-center text-center px-4 gap-2">
                        <ArrowRightFromLine size={36} className="mb-6 w-16 h-16 text-white" />
                        <h3 className="text-lg font-bold mb-2 text-[#FFFFFF]">
                            Examples of protocols to <br /> Engage with Your DDAI
                        </h3>
                        <p className="text-base font-normal text-[#FFFFFF] max-w-xs">
                            Here are some commands to get you started with DDAI.
                        </p>
                    </div>

                    {/* Item 3 */}
                    <div className="flex flex-col items-center text-center px-4 gap-2">
                        <LucideCompass size={36} className="mb-6 w-16 h-16 text-white" />
                        <h3 className="text-lg font-bold mb-2 text-[#FFFFFF]">
                            Discover the Versatility of DDAI <br /> with These Command Examples
                        </h3>
                        <p className="text-base font-normal text-[#FFFFFF] max-w-xs">
                            Use these phrases to unlock the full potential of your AI.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
