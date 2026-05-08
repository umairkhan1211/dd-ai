import { motion } from "framer-motion";
import AiImage from "@/assets/Footer/footerAiIcon.png";
import { Link } from "react-router-dom";
import { Instagram, Youtube, Twitter } from "lucide-react";

const footerSections = [
  {
    title: "Product",
    items: [
      { label: "Features", href: "/features" },
      { label: "Integration", href: "/" },
      { label: "Updates", href: "/" },
      { label: "FAQ", href: "/" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/" },
      { label: "Careers", href: "/" },
      { label: "Manifesto", href: "/" },
      { label: "Press", href: "/" },
      { label: "Contract", href: "/" },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Examples", href: "/" },
      { label: "Community", href: "/" },
      { label: "Guides", href: "/" },
      { label: "Docs", href: "/" },
      { label: "Press", href: "/" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Privacy", href: "/" },
      { label: "Terms", href: "/" },
      { label: "Security", href: "/" },
    ],
  },
];

const baseAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

export const Footer = () => {
  return (
    <motion.footer
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, amount: 0.3 }}
      className="w-full bg-black text-white px-6 sm:px-12 lg:px-16 py-12 flex flex-col gap-16"
    >
      {/* Top Section: Logo (35%) + Links & Form (65%) */}
      <div className="flex flex-col md:flex-row justify-between gap-12 md:gap-16">
        {/* Brand Logo – 35% */}
        <motion.div
          variants={{
            initial: { opacity: 0, x: -20 },
            animate: { opacity: 1, x: 0 },
          }}
          transition={{ ...baseAnimation.transition, delay: 0.1 }}
          className="flex flex-col gap-6 w-full md:w-1/3"
        >
          <img
            src={AiImage}
            alt="AI Startup Kit"
            className="w-44 h-auto object-contain"
          />
        </motion.div>

        {/* Navigation Links + Newsletter Form – 65% */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-2 w-full md:w-[70%]">
          {footerSections.map((section, i) => (
            <motion.div
              key={section.title}
              variants={baseAnimation}
              transition={{ ...baseAnimation.transition, delay: 0.2 + i * 0.1 }}
            >
              <h4 className="text-white font-semibold mb-3 md:mb-4 text-sm md:text-base">
                {section.title}
              </h4>
              <ul className="space-y-1.5 text-white/70 text-xs md:text-sm">
                {section.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.href}
                      className="hover:underline cursor-pointer text-white/70"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Newsletter Column */}
          <motion.div
            variants={baseAnimation}
            transition={{
              ...baseAnimation.transition,
              delay: 0.2 + footerSections.length * 0.1,
            }}
            className="col-span-2 sm:col-span-2 flex flex-col space-y-3 w-[80%]"
          >
            <h4 className="text-white font-semibold text-lg md:text-base">
              Join
            </h4>
            <p className="text-white/70 text-xs md:text-sm leading-relaxed">
              Join our newsletter for the latest updates and insights.
            </p>
            <form className="flex flex-col space-y-1.5">
              <input
                type="email"
                placeholder="Your Email"
                className="px-3 py-2 rounded-md bg-white text-black text-center text-xs md:text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-white placeholder:text-gray-500"
              />

              <button
                type="submit"
                className="py-2 rounded-md bg-white text-black font-semibold text-xs md:text-sm hover:bg-gray-200 transition-colors"
              >
                Join
              </button>
            </form>
            <p className="text-white/50 text-[10px] md:text-xs leading-relaxed">
              By joining, you agree to our{" "}
              <Link to="/privacy" className="underline">
                Privacy Policy
              </Link>{" "}
              and consent to receive updates.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Bottom Social Icons */}
      <motion.div
        variants={baseAnimation}
        transition={{ ...baseAnimation.transition, delay: 1.2 }}
        className="w-full flex justify-center md:justify-start gap-5 md:gap-6 text-white/70"
      >
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
          <Twitter className="w-5 h-5 hover:text-white transition-colors" />
        </a>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Instagram className="w-5 h-5 hover:text-white transition-colors" />
        </a>
        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
          <Youtube className="w-5 h-5 hover:text-white transition-colors" />
        </a>
      </motion.div>
    </motion.footer>
  );
};
