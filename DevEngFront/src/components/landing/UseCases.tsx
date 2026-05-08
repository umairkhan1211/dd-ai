
import { motion } from "framer-motion";
import { Brain, Code, MessageSquare, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface UseCaseCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  benefits: string[];
  index: number;
}

const UseCaseCard = ({ icon: Icon, title, description, benefits, index }: UseCaseCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="bg-card border border-primary/10 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
  >
    <div className="bg-gradient-to-r from-primary/5 to-transparent p-6 border-b border-border/30">
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-xl font-medium">{title}</h3>
      </div>
      <p className="text-muted-foreground">{description}</p>
    </div>
    
    <div className="p-6">
      <h4 className="font-medium mb-3">Benefits</h4>
      <ul className="space-y-2">
        {benefits.map((benefit, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className="text-primary mt-1">•</span>
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
    </div>
  </motion.div>
);

export function UseCases() {
  const useCases = [
    {
      icon: Brain,
      title: "ADHD Management",
      description: "Create structure to manage executive function challenges",
      benefits: [
        "Reduce decision fatigue with clear protocol structures",
        "Maintain focus with task-specific cast members",
        "Get gentle reminders when attention drifts",
        "Convert scattered thoughts into actionable plans"
      ]
    },
    {
      icon: Code,
      title: "Complex Projects",
      description: "Manage multifaceted technical and creative endeavors",
      benefits: [
        "Break down large projects into manageable components",
        "Get specialized technical guidance from different perspectives",
        "Maintain context across multiple work sessions",
        "Track progress and interdependencies systematically"
      ]
    },
    {
      icon: MessageSquare,
      title: "Creative Writing",
      description: "Support the writing process from ideation to editing",
      benefits: [
        "Generate ideas from multiple creative perspectives",
        "Maintain consistent voice and tone across long works",
        "Get specialized feedback on different aspects of writing",
        "Overcome creative blocks with structured protocols"
      ]
    },
    {
      icon: Settings,
      title: "Decision Support",
      description: "Navigate complex personal and professional decisions",
      benefits: [
        "Consider options from multiple strategic perspectives",
        "Identify cognitive biases affecting your thinking",
        "Document decision factors and weighting criteria",
        "Review past decisions to improve future ones"
      ]
    }
  ];

  return (
    <div className="notion-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-center mb-12 md:mb-16 px-4"
      >
        <h2 className="text-3xl md:text-4xl font-semibold mb-4">Use Cases</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          How different users leverage the Deviation Engine for their unique needs
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 mb-12">
        {useCases.map((useCase, index) => (
          <UseCaseCard
            key={useCase.title}
            icon={useCase.icon}
            title={useCase.title}
            description={useCase.description}
            benefits={useCase.benefits}
            index={index}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-center px-4"
      >
        <Link to="/signup">
          <Button className="shadow-md shadow-primary/10">
            Start Building Your System
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
