import { motion } from "framer-motion";
import { CircleCheck, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ModeComparison() {
  const modes = [
    {
      id: "guided",
      name: "Guided Mode",
      description: "Perfect for new users getting started with the Deviation Engine",
      targetUser: "New or casual users",
      interfaceTraits: [
        "Simplified interface",
        "Visual cues and tooltips",
        "Friendly cast prompts",
        "Step-by-step guidance"
      ],
      coreFeatures: [
        "Basic cast interaction",
        "Preset protocol buttons",
        "Simple operator profile",
        "Essential functionality"
      ]
    },
    {
      id: "builder",
      name: "Builder Mode",
      description: "Designed for power users who want to customize their experience",
      targetUser: "Power users, neurodivergent thinkers",
      interfaceTraits: [
        "Full access to cast editing",
        "Protocol configuration",
        "Manual rule setting",
        "Advanced profile options"
      ],
      coreFeatures: [
        "Step Chaining",
        "Recursive design capabilities",
        "Memory management",
        "Custom cast creation"
      ]
    },
    {
      id: "operator",
      name: "Operator Mode",
      description: "Clean, focused interface for productive daily use",
      targetUser: "Core productivity users",
      interfaceTraits: [
        "Streamlined interface",
        "All systems active",
        "Self-guided operation",
        "Minimal visual distractions"
      ],
      coreFeatures: [
        "Full cast access",
        "All protocol functions",
        "Complete rule system",
        "Maximum recursion depth"
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
        <h2 className="text-3xl md:text-4xl font-semibold mb-4">Flexible Interface Modes</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose the interface that matches your experience level and cognitive needs
        </p>
      </motion.div>

      <div className="px-4">
        <Tabs defaultValue="guided" className="w-full">
          <TabsList className="w-full mb-8 grid grid-cols-3">
            <TabsTrigger value="guided">Guided</TabsTrigger>
            <TabsTrigger value="builder">Builder</TabsTrigger>
            <TabsTrigger value="operator">Operator</TabsTrigger>
          </TabsList>

          {modes.map((mode) => (
            <TabsContent key={mode.id} value={mode.id} className="mt-0">
              <div className="bg-card border border-primary/10 rounded-xl p-6 md:p-8 shadow-sm">
                <h3 className="text-2xl font-semibold mb-2">{mode.name}</h3>
                <p className="text-muted-foreground mb-6">{mode.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-medium text-lg mb-4 flex items-center">
                      <span className="bg-primary/10 text-primary w-6 h-6 inline-flex items-center justify-center rounded-full text-sm mr-2">1</span>
                      Interface Traits
                    </h4>
                    <ul className="space-y-3">
                      {mode.interfaceTraits.map((trait, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-primary" />
                          <span>{trait}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-lg mb-4 flex items-center">
                      <span className="bg-primary/10 text-primary w-6 h-6 inline-flex items-center justify-center rounded-full text-sm mr-2">2</span>
                      Core Features
                    </h4>
                    <ul className="space-y-3">
                      {mode.coreFeatures.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-primary" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border/50">
                  <h4 className="font-medium mb-2">Best For</h4>
                  <p className="text-muted-foreground">{mode.targetUser}</p>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
