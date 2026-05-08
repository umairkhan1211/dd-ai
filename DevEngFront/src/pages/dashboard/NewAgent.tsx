import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AgentForm } from "@/components/agents/AgentForm";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { AgentType } from "@/components/agents/AgentCard";

const agentTemplates: Omit<AgentType, "id">[] = [
  {
    name: "CTO Advisor",
    role: "Technology Consultant",
    description:
      "Advises on technology decisions, software architecture, and security matters.",
    specialty: ["Tech Stack", "Architecture", "Security", "Scalability"],
  },
  {
    name: "Marketing Specialist",
    role: "Marketing Strategy",
    description:
      "Expert in digital marketing tactics and campaign optimization.",
    specialty: ["Content Strategy", "SEO", "Social Media", "Market Analysis"],
  },
  {
    name: "Business Analyst",
    role: "Business Strategy",
    description:
      "Analyses business processes and provides recommendations for improvement.",
    specialty: [
      "SWOT Analysis",
      "Market Research",
      "Financial Modeling",
      "Process Optimization",
    ],
  },
];

const NewAgent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCreateAgent = (agentData: Omit<AgentType, "id">) => {
    // This would create an agent via API in a real app

    toast({
      title: "Agent created",
      description: `"${agentData.name}" has been created successfully.`,
    });

    // Navigate back to agents page
    navigate("/dashboard/agents");
  };

  const handleUseTemplate = (template: Omit<AgentType, "id">) => {
    // In a real app, you would either redirect to the form with template data
    // or directly create the agent from the template
    handleCreateAgent(template);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create New Agent</h1>

        <Tabs defaultValue="custom">
          <TabsList className="mb-6">
            <TabsTrigger value="custom">Custom Agent</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="custom">
            <Card>
              <CardHeader>
                <CardTitle>Agent Details</CardTitle>
                <CardDescription>
                  Create a new AI agent with specific characteristics and
                  specialties.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AgentForm onSubmit={handleCreateAgent} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <div className="space-y-4">
              {agentTemplates.map((template, index) => (
                <Card key={index} className="notion-card">
                  <CardHeader>
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription>{template.role}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {template.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {template.specialty.map((spec, i) => (
                        <span
                          key={i}
                          className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                    <Button
                      onClick={() => handleUseTemplate(template)}
                      className="w-full"
                    >
                      Use This Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default NewAgent;
