
import { motion } from "framer-motion";
import { FileCode, Users, Settings, Layers, Lightbulb, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: "easeOut" }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard = ({ icon: Icon, title, description, delay }: FeatureCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="bg-card border border-primary/5 rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
  >
    <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-primary" />
    </div>
    <h3 className="text-xl font-medium mb-3">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </motion.div>
);

export function Features() {
  const features = [
    {
      icon: Users,
      title: "Cast System",
      description: "Create AI personas with defined roles, voices, and memory behaviors that adapt to your needs."
    },
    {
      icon: FileCode,
      title: "Protocol Engine",
      description: "Use natural language to invoke functions like 'Reflect' or 'Loop It' that trigger multi-step behaviors."
    },
    {
      icon: Settings,
      title: "Rules & Operator Profile",
      description: "Define persistent behavior constraints and evolve your self-definition layer over time."
    },
    {
      icon: Layers,
      title: "Recursion & Stacking",
      description: "Enable recursive refinements, function chaining, and layered tool use for complex tasks."
    },
    {
      icon: Lightbulb,
      title: "Flexible Interfaces",
      description: "Choose between Guided, Builder, and Operator modes to match your experience level and needs."
    },
    {
      icon: Brain,
      title: "Cognitive Adaptation",
      description: "A system that learns from your interactions and adapts to your unique thought patterns."
    }
  ];

  return (
    <div className="notion-container">
      <motion.div
        variants={staggerChildren}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        <motion.div
          variants={fadeInUp}
          className="text-center mb-12 md:mb-16 px-4"
        >
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">Core Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The Deviation Engine transforms how you interact with AI through these key capabilities
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 mb-12">
          {features.map((feature, index) => (
            <FeatureCard 
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 0.1}
            />
          ))}
        </div>

        <motion.div 
          variants={fadeInUp} 
          className="text-center"
        >
          <Link to="/features">
            <Button variant="outline" className="border-primary/20">Learn More About Features</Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
