
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { AgentCard, AgentType } from "@/components/agents/AgentCard";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Agents = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState<string>("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<string | null>(null);

  // Sample demo data
  const [agents, setAgents] = useState<AgentType[]>([
    {
      id: "1",
      name: "Marketing Specialist",
      role: "Strategy Advisor",
      description: "Expert in digital marketing tactics and campaign optimization",
      specialty: ["Content Strategy", "SEO", "Social Media"]
    },
    {
      id: "2",
      name: "Technical Writer",
      role: "Documentation Expert",
      description: "Specializes in clear, concise technical documentation and guides",
      specialty: ["API Docs", "User Guides", "Tutorial Creation"]
    },
    {
      id: "3",
      name: "UX Researcher",
      role: "User Experience Analyst",
      description: "Focuses on understanding user behaviors and needs for product improvement",
      specialty: ["User Testing", "UX Design", "Data Analysis"]
    },
    {
      id: "4",
      name: "Business Analyst",
      role: "Strategic Planning",
      description: "Provides insights for business growth and operational efficiency",
      specialty: ["SWOT Analysis", "Market Research", "Financial Modeling"]
    },
    {
      id: "5",
      name: "CTO Advisor",
      role: "Technology Consultant",
      description: "Advises on technology decisions, architecture, and security matters",
      specialty: ["Tech Stack", "Architecture", "Security"]
    }
  ]);

  // Get all unique specialties
  const allSpecialties = Array.from(
    new Set(agents.flatMap(agent => agent.specialty))
  ).sort();

  const handleDeleteAgent = (id: string) => {
    setAgentToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (agentToDelete) {
      setAgents(agents.filter(agent => agent.id !== agentToDelete));
      toast({
        title: "Agent deleted",
        description: "The agent has been removed successfully.",
      });
      setIsDeleteDialogOpen(false);
      setAgentToDelete(null);
    }
  };

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = 
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.specialty.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesSpecialty = 
      filterSpecialty === "all" || 
      agent.specialty.some(spec => spec === filterSpecialty);
      
    return matchesSearch && matchesSpecialty;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h1 className="text-3xl font-bold">AI Agents</h1>
          <Link to="/dashboard/agents/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Agent
            </Button>
          </Link>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by specialty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              {allSpecialties.map(specialty => (
                <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {filteredAgents.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} onDelete={handleDeleteAgent} />
            ))}
          </div>
        ) : (
          <div className="bg-muted p-6 rounded-lg text-center">
            <p className="text-muted-foreground mb-4">No agents found. Try another search or create a new agent.</p>
            <Link to="/dashboard/agents/new">
              <Button>Create New Agent</Button>
            </Link>
          </div>
        )}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this agent. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Agents;
