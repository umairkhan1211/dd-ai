
import { MainLayout } from "@/components/layout/MainLayout";
import { StreamingChatInterface } from "@/components/chat/StreamingChatInterface";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { AgentType } from "@/components/agents/AgentCard";

// Sample agent data
const demoAgents: AgentType[] = [
  {
    id: "1",
    name: "Dax",
    role: "Logic Strategist",
    description: "Core processing, structure, and protocol logic",
    specialty: ["Structure", "Logic"],
  },
  {
    id: "2", 
    name: "Hollis",
    role: "Productivity Enforcer",
    description: "Execution pressure, reminders, prioritization",
    specialty: ["Discipline", "Focus"],
  },
  {
    id: "3",
    name: "Dan",
    role: "Hidden Strategist",
    description: "Critical thinking, alternate pathways",
    specialty: ["Strategy", "Analysis"],
  },
  {
    id: "4",
    name: "Leo",
    role: "Linguistics Specialist",
    description: "Refines language, improves clarity",
    specialty: ["Communication", "Clarity"],
  },
];

const StreamChatDemo = () => {
  const isMobile = useIsMobile();
  
  return (
    <MainLayout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto py-8"
      >
        <div className="flex flex-col w-full max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">Streaming Chat Demo</h1>
          <p className="text-muted-foreground mb-8">
            Test the streaming chat interface with real-time AI responses
          </p>
          
          <div className={`bg-card border rounded-xl ${isMobile ? "h-[70vh]" : "h-[80vh]"}`}>
            <StreamingChatInterface
              projectId="demo-project"
              projectTitle="Demo Project"
              projectAgents={demoAgents}
            />
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default StreamChatDemo;
