import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import logicStrategistAndCoordinatorProfile from "@/assets/Avatar/default-avatar-1.webp";
import disciplineAndProductivityEnforcerProfile from "@/assets/Avatar/default-avatar-3.webp";
import hiddenStrategistProfile from "@/assets/Avatar/default-avatar-2.webp";

import {
  CastMemberForm,
  SubmitCastMemberData,
} from "@/components/deviation/CastMemberForm";
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
import { useCastMembers } from "@/hooks/use-cast-members";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";


const castMemberTemplates: SubmitCastMemberData[] = [
  {
    instruction: "Core processing, structure, protocol logic",
    name: "Dax",
    functionalRole: "Logic Strategist & Coordinator",
    defaultTone: "Precise, direct",
    description: "Core processing, structure, protocol logic",
    avatar: logicStrategistAndCoordinatorProfile,
    // invocationPhrases: ["Reflect", "Begin", "Refine"],
    // priority: 0,
  },
  {
    instruction: "Core processing, structure, protocol logic",
    name: "Hollis",
    functionalRole: "Discipline & Productivity Enforcer",
    defaultTone: "Stern, fair",
    description:
      "Execution pressure, reminders, prioritization, decision fatigue",
    avatar: disciplineAndProductivityEnforcerProfile,
    // invocationPhrases: ["Gauge", "Lock-In", "Begin"],
    // priority: 1,
  },
  {
    instruction: "Core processing, structure, protocol logic",
    name: "Dan",
    functionalRole: "Hidden Strategist",
    defaultTone: "Insightful, abstract",
    description: "Critical thinking, alternate pathways",
    avatar: hiddenStrategistProfile,
    // invocationPhrases: ["Reflect", "Summarize"],
    // priority: 0,
  },
];

const NewCastMemberPage = () => {
  const navigate = useNavigate();
  const { useCreateCastMember } = useCastMembers();
  const createCastMemberMutation = useCreateCastMember();


  const [initialFormTemplateData, setInitialFormTemplateData] = useState<
    SubmitCastMemberData | undefined
  >(undefined);
  const [activeTab, setActiveTab] = useState("custom");
  const [showExampleModal, setShowExampleModal] = useState(false);


  const handleCreateCastMember = (castMemberData: SubmitCastMemberData) => {
    createCastMemberMutation.mutate(castMemberData, {
      onSuccess: () => {
        navigate("/dashboard/cast-members");
      },
    });
  };

  const handleUseTemplate = (template: SubmitCastMemberData) => {
    setInitialFormTemplateData(template);
    setActiveTab("custom");
  };

  const handleClearTemplate = () => {
    // put any extra logic here before clearing
    // reset template data
    setInitialFormTemplateData(undefined);

    // reset walkthrough step index in localStorage
    // localStorage.setItem("walkthroughStepIndex", "6");
  };

  const handleFromTemplateClick = () => {
    // persist in localStorage
    // localStorage.setItem("walkthroughStepIndex", "1");
  };

  const handleFillTemplate = (template: any) => {
    // call your existing function
    handleUseTemplate(template);

    // reset walkthrough step instantly
    // localStorage.setItem("walkthroughStepIndex", "2");
  };

  return (
    <DashboardLayout>

      <div className="max-w-2xl w-full mx-auto py-8 px-4 sm:px-6 lg:px-8 z-10 relative">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-color ">
          Create New Cast Member
        </h1>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-6 glass-tabs p-4 sm:p-6 relative rounded-xl"
        >
          <div className="circle circle-2"></div>

          {/* Tabs header */}
          <TabsList className="grid w-full grid-cols-2 gap-2 glass-tabs rounded-xl">
            <TabsTrigger className="CustomCastMembers text-sm sm:text-base" value="custom">
              Custom Cast Member
            </TabsTrigger>
            <TabsTrigger
              className="fromTemplete text-sm sm:text-base"
              value="templates"
              onClick={handleFromTemplateClick}
            >
              From Template
            </TabsTrigger>
          </TabsList>

          {/* Custom tab */}
          <TabsContent value="custom">
            <Card className="mt-4">
              <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="font-ubuntu relative z-30 text-lg sm:text-xl">
                    Cast Member Details
                  </CardTitle>
                  <CardDescription className="max-w-full sm:max-w-[350px] font-ubuntu text-sm">
                    {initialFormTemplateData
                      ? "Review and customize the template below, or clear to start fresh."
                      : "Fill in the details to create a new cast member."}
                  </CardDescription>
                </div>

                {/* Example dialog */}
                <Dialog open={showExampleModal} onOpenChange={setShowExampleModal}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-[rgb(100,55,236)] hover:text-white hover:bg-[rgb(83,31,239)] w-full sm:w-auto"
                    >
                      See Example
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-color font-ubuntu">
                        Cast Member Example
                      </DialogTitle>
                      <DialogDescription>
                        <div className="space-y-4 mt-4">
                          {[
                            {
                              title: "🧠 Example 1: Support Assistant",
                              name: "Support Sage",
                              tone: "Friendly and reassuring",
                              description:
                                "A calm, clear-thinking assistant who explains things simply and keeps users from feeling overwhelmed.",
                              instruction:
                                "Guide users step-by-step through onboarding, answer basic product usage questions, and ensure they feel supported.",
                              value:
                                "Helps new users get started without confusion, builds trust, and increases satisfaction with the product.",
                            },
                            {
                              title: "💼 Example 2: Sales Advisor",
                              name: "SmartSeller",
                              tone: "Persuasive but honest",
                              description:
                                "A sharp, energetic advisor who understands user needs and recommends the perfect product.",
                              instruction:
                                "Ask customers what they’re looking for, recommend top-selling items that match their preferences, and handle basic objections.",
                              value:
                                "Saves time, reduces choice overload, and helps customers make confident purchase decisions.",
                            },
                            {
                              title: "📚 Example 3: Learning Guide",
                              name: "SkillBuilder Bot",
                              tone: "Encouraging and patient",
                              description:
                                "A motivating teacher-like guide who adapts to the learner’s pace and provides regular encouragement.",
                              instruction:
                                "Provide small learning steps, give feedback on progress, and offer tips for improvement.",
                              value:
                                "Enhances user learning experience, improves retention, and increases platform engagement.",
                            },
                            {
                              title: "🧭 Example 4: Product Tour Guide",
                              name: "Feature Fox",
                              tone: "Playful yet informative",
                              description:
                                "An enthusiastic guide who highlights product features with energy and clarity.",
                              instruction:
                                "Introduce users to key features, explain their benefits in simple terms, and encourage them to try them out.",
                              value:
                                "Boosts product adoption and discovery of hidden features, resulting in better user satisfaction.",
                            },
                          ].map((example, i) => (
                            <Card key={i}>
                              <CardContent className="py-4 space-y-2 text-sm sm:text-base">
                                <h3 className="font-semibold font-ubuntu text-lg">{example.title}</h3>
                                <p>
                                  <strong>Name:</strong> {example.name}
                                </p>
                                <p>
                                  <strong>Tone:</strong> {example.tone}
                                </p>
                                <p>
                                  <strong>Description (Personality):</strong> <br />
                                  {example.description}
                                </p>
                                <p>
                                  <strong>Instruction:</strong> <br />
                                  {example.instruction}
                                </p>
                                <p>
                                  <strong>💡 Value to Customer:</strong> <br />
                                  {example.value}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </CardHeader>

              <CardContent>
                <CastMemberForm
                  onSubmit={handleCreateCastMember}
                  initialData={initialFormTemplateData}
                  isSubmitting={createCastMemberMutation.isPending}
                />
                {initialFormTemplateData && (
                  <Button
                    variant="link"
                    onClick={handleClearTemplate}
                    className="clear-template mt-4 pl-0 text-sm"
                  >
                    Clear Template & Start Fresh
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates tab */}
          <TabsContent value="templates">
            <div className="space-y-4 mt-4">
              {castMemberTemplates.map((template, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">{template.name}</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      {template.functionalRole}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                    <div className="text-sm mb-2">
                      <span className="font-medium">Tone:</span> {template.defaultTone}
                    </div>
                    <Button
                      onClick={() => handleFillTemplate(template)}
                      className="template-button w-full "
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

export default NewCastMemberPage;
