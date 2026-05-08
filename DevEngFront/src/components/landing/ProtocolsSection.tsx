
import { motion } from "framer-motion";
import { FileCode, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const protocolData = [
  {
    name: "Reflect",
    purpose: "Review user behavior and offer gentle recalibration",
    deliveredBy: "Dax",
    notes: "Uses last 8 prompts to analyze behavior patterns"
  },
  {
    name: "Begin",
    purpose: "Starts a new structured task based on user prompt",
    deliveredBy: "Any",
    notes: "Optional: choose cast member to lead task"
  },
  {
    name: "Refine",
    purpose: "Runs content through 1–3 refinement iterations",
    deliveredBy: "Dax",
    notes: "Improves clarity and structure of content"
  },
  {
    name: "Summarize",
    purpose: "Condense content or task into digestible insight",
    deliveredBy: "Dax",
    notes: "Uses formatting rules for consistent output"
  },
  {
    name: "Gauge",
    purpose: "Evaluate quality or value of a recent decision",
    deliveredBy: "Hollis",
    notes: "Uses fixed criteria or rule-based heuristics"
  },
  {
    name: "Lock-In",
    purpose: "Finalizes a decision or block of work",
    deliveredBy: "Any",
    notes: "Prevents further edits to maintain focus"
  }
];

export function ProtocolsSection() {
  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-center mb-12 md:mb-16 px-4"
      >
        <h2 className="text-3xl md:text-5xl font-semibold mb-4 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          Language-Driven Protocols
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Trigger complex behaviors with natural language commands
        </p>
      </motion.div>

      {/* Premium highlight card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="bg-gradient-to-r from-primary/10 to-purple-400/10 rounded-2xl p-1 mb-12 mx-4"
      >
        <div className="bg-card/90 backdrop-blur-sm rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 border border-primary/10">
          <div className="flex-shrink-0 bg-primary/10 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-primary" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl md:text-2xl font-medium mb-2">Protocol-Driven Interaction</h3>
            <p className="text-muted-foreground mb-4">
              The Deviation Engine's protocols allow you to trigger complex behaviors using simple language commands. Each protocol is designed to offload specific cognitive tasks - from reflection to decision-making.
            </p>
            <Link to="/features">
              <Button variant="outline" className="border-primary/20">
                Learn How Protocols Work
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col gap-6 md:gap-8 px-4">
        {protocolData.map((protocol, index) => (
          <motion.div
            key={protocol.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group bg-card border border-primary/10 rounded-xl p-6 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <FileCode className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{protocol.name}</h3>
            </div>
            
            <div className="space-y-4 text-sm mb-6">
              <p className="leading-relaxed">{protocol.purpose}</p>
            </div>
            
            <div className="flex flex-wrap gap-2 items-center justify-between mt-auto pt-4 border-t border-border/50">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-1">
                {protocol.deliveredBy}
              </Badge>
              <span className="text-xs text-muted-foreground">{protocol.notes}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="flex justify-center mt-12"
      >
        <Link to="/features">
          <Button variant="outline" className="border-primary/20">
            View All Protocols
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
