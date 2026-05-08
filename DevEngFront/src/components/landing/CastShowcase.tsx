
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const castMembers = [
  {
    name: "Dax",
    role: "Logic Strategist & Coordinator",
    tone: "Precise, direct",
    function: "Core processing, structure, protocol logic",
    color: "bg-blue-100 text-blue-800"
  },
  {
    name: "Hollis",
    role: "Discipline & Productivity Enforcer",
    tone: "Stern, fair",
    function: "Execution pressure, reminders, prioritization",
    color: "bg-amber-100 text-amber-800"
  },
  {
    name: "Dan",
    role: "Hidden Strategist",
    tone: "Insightful, abstract",
    function: "Critical thinking, alternate pathways",
    color: "bg-violet-100 text-violet-800"
  },
  {
    name: "Leo",
    role: "Linguistics & Narrative Specialist",
    tone: "Clear, constructive",
    function: "Refines language, improves clarity",
    color: "bg-green-100 text-green-800"
  },
  {
    name: "Clara",
    role: "Value Strategist",
    tone: "Calm, audience-focused",
    function: "Assesses usefulness and reader relevance",
    color: "bg-pink-100 text-pink-800"
  },
  {
    name: "Jiang",
    role: "Psychologist & Emotional Insight",
    tone: "Thoughtful, empathetic",
    function: "Offers psychological framing, emotional support",
    color: "bg-indigo-100 text-indigo-800"
  }
];

export function CastShowcase() {
  return (
    <div className="notion-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-center mb-12 md:mb-16 px-4"
      >
        <h2 className="text-3xl md:text-4xl font-semibold mb-4">The Cast System</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Leverage specialized AI personas with distinct roles, personalities, and expertise
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
        {castMembers.map((member, index) => (
          <motion.div
            key={member.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-card border border-primary/10 rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-medium">{member.name}</h3>
              <Badge variant="outline" className={`${member.color} border-0`}>
                Cast Member
              </Badge>
            </div>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Role:</span>
                <p>{member.role}</p>
              </div>
              
              <div>
                <span className="font-medium text-muted-foreground">Tone:</span>
                <p>{member.tone}</p>
              </div>
              
              <div>
                <span className="font-medium text-muted-foreground">Function:</span>
                <p>{member.function}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
