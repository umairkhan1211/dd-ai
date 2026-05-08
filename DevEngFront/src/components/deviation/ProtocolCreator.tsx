import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Trash2,
  Settings,
  Zap,
  Layers,
  Info,
  HelpCircle,
  ClipboardPlus,
  Check,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProtocols } from "@/hooks/use-protocols";
import {
  CreateProtocolPayload,
  ProtocolType,
} from "@/services/protocolService";
import { useSubscription } from "@/hooks/use-subscription";
import { useCastMembers } from "@/hooks/use-cast-members";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useAiModels } from "@/services/aiModelService";
interface ProtocolCreatorProps {
  initialData?: Partial<ProtocolType>;
  onProtocolCreated?: (protocol: ProtocolType) => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  editingProtocol?: ProtocolType | null;
  onClose?: () => void;
}

interface InputField {
  name: string;
  type: "text" | "select" | "number" | "boolean";
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  defaultValue?: string | number | boolean;
}

interface ModifierField {
  name: string;
  type: "select" | "toggle" | "slider";
  label: string;
  options?: string[];
  defaultValue?: string | number | boolean;
  min?: number;
  max?: number;
}

interface LogicCondition {
  field: string;
  operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than";
  value: string | number | boolean;
  action: string;
}

interface LogicStep {
  name: string;
  promptTemplate: string;
  dependsOn?: string[];
}

export function ProtocolCreator({
  initialData,
  onProtocolCreated,
  trigger,
  open: controlledOpen,
  onOpenChange,
  editingProtocol,
  onClose,
}: ProtocolCreatorProps) {
  const { data: aiModelsResponse, isLoading } = useAiModels();
  const modelsArray = aiModelsResponse?.data;
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [showLevel3Warning, setShowLevel3Warning] = useState(false);

  // when modelsArray loads, pick GPT-4o by displayName if present, else first model
  // useEffect(() => {
  //   if (modelsArray && modelsArray.length > 0) {
  //     const gpt4oModel = modelsArray.find(m => m.displayName === "GPT-4o");
  //     const defaultId = gpt4oModel ? gpt4oModel.id : modelsArray[0].id;

  //     setSelectedModelId(initialData?.aiModelId ?? defaultId);
  //   }
  // }, [modelsArray, initialData]);

  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const [currentLevel, setCurrentLevel] = useState<1 | 2 | 3>(1);
  const { toast } = useToast();
  const { useCreateProtocol, useUpdateProtocol } = useProtocols();
  const createProtocolMutation = useCreateProtocol();
  const updateProtocolMutation = useUpdateProtocol();

  // Basic protocol data
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [deliveredBy, setDeliveredBy] = useState("");
  const [promptTemplate, setPromptTemplate] = useState("");

  // Level 2 & 3 data
  const [inputs, setInputs] = useState<InputField[]>([]);
  const [modifiers, setModifiers] = useState<ModifierField[]>([]);

  // Level 3 data
  const [conditions, setConditions] = useState<LogicCondition[]>([]);
  const [iterationsEnabled, setIterationsEnabled] = useState(false);
  const [maxIterations, setMaxIterations] = useState(3);
  const [showProgress, setShowProgress] = useState(true);
  const [chainingEnabled, setChainingEnabled] = useState(false);
  const [chainingSteps, setChainingSteps] = useState<LogicStep[]>([]);

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      setPromptTemplate((prev) => prev + clipText);
    } catch (err) {
      console.error("Clipboard read failed:", err);
    }
  };
  const handleDescriptionPaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      setDescription((prev) => prev + clipText);
    } catch (err) {
      console.error("Clipboard read failed:", err);
    }
  };
  const handleDeliveredByPaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      setDeliveredBy((prev) => prev + clipText);
    } catch (err) {
      console.error("Clipboard read failed:", err);
    }
  };

  const handleProtocolNamePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      setName((prev) => prev + clipText);
    } catch (err) {
      console.error("Clipboard read failed:", err);
    }
  };

  const handleNamePaste = async (index: number) => {
    try {
      const clipText = await navigator.clipboard.readText();

      setInputs((prev) => {
        const newInputs = [...prev]; // copy array
        newInputs[index] = {
          ...newInputs[index],
          name: newInputs[index].name + clipText, // update name field
        };
        return newInputs;
      });
    } catch (err) {
      console.error("Clipboard read failed:", err);
    }
  };

  const handleLabelPaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();

      setInputs((prev) => {
        if (prev.length === 0) return prev; // no inputs yet

        // Update the first input's label only
        const updated = [...prev];
        updated[0] = {
          ...updated[0],
          label: (updated[0].label || "") + clipText,
        };

        return updated;
      });
    } catch (err) {
      console.error("Clipboard read failed:", err);
    }
  };

  const handlePlaceholderPaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();

      setInputs((prev) => {
        if (prev.length === 0) return prev; // no inputs yet

        const updated = [...prev];
        updated[0] = {
          ...updated[0],
          placeholder: (updated[0].placeholder || "") + clipText,
        };

        return updated;
      });
    } catch (err) {
      console.error("Clipboard read failed:", err);
    }
  };

  const handleStepNamePaste = async (index: number) => {
    try {
      const clipText = await navigator.clipboard.readText();

      setChainingSteps((prev) => {
        const newSteps = [...prev]; // copy steps array
        newSteps[index] = {
          ...newSteps[index],
          name: newSteps[index].name + clipText, // update step name
        };
        return newSteps;
      });
    } catch (err) {
      console.error("Clipboard read failed:", err);
    }
  };

  const handleStepPromptTemplatePaste = async (index: number) => {
    try {
      const clipText = await navigator.clipboard.readText();

      setChainingSteps((prev) => {
        const newSteps = [...prev]; // copy steps array
        newSteps[index] = {
          ...newSteps[index],
          promptTemplate: newSteps[index].promptTemplate + clipText, // update step promptTemplate
        };
        return newSteps;
      });
    } catch (err) {
      console.error("Clipboard read failed:", err);
    }
  };


  useEffect(() => {
    if (currentLevel === 3) {
      setShowLevel3Warning(true);
    }
  }, [currentLevel]);

  useEffect(() => {
    if (modelsArray?.length > 0) {
      setSelectedModelId(initialData?.aiModelId || modelsArray[0].id);
    }
  }, [modelsArray, initialData]);

  // Populate form when editing
  useEffect(() => {
    if (editingProtocol) {
      setName(editingProtocol.name);
      setDescription(editingProtocol.description);
      setCurrentLevel(editingProtocol.level);
      setCategory(editingProtocol.category || "General");
      setDeliveredBy(editingProtocol.deliveredBy || "");
      setPromptTemplate(editingProtocol.promptTemplate);
      setInputs(editingProtocol.inputs || []);
      setModifiers(editingProtocol.modifiers || []);

      if (editingProtocol.logic) {
        setConditions(editingProtocol.logic.conditions || []);
        setIterationsEnabled(
          editingProtocol.logic.iterations?.enabled || false
        );
        setMaxIterations(editingProtocol.logic.iterations?.maxIterations || 3);
        setShowProgress(editingProtocol.logic.iterations?.showProgress || true);
        setChainingEnabled(editingProtocol.logic.chaining?.enabled || false);
        setChainingSteps(editingProtocol.logic.chaining?.steps || []);
      }
    }
  }, [editingProtocol]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategory("General");
    setDeliveredBy("");
    setPromptTemplate("");
    setInputs([]);
    setModifiers([]);
    setConditions([]);
    setIterationsEnabled(false);
    setMaxIterations(3);
    setShowProgress(true);
    setChainingEnabled(false);
    setChainingSteps([]);
  };

  const addInput = () => {
    setInputs([
      ...inputs,
      {
        name: "",
        type: "text",
        label: "",
        required: false,
        placeholder: "",
      },
    ]);
  };

  const removeInput = (index: number) => {
    setInputs(inputs.filter((_, i) => i !== index));
  };

  const updateInput = (
    index: number,
    field: keyof InputField,
    value: string | boolean | string[]
  ) => {
    const newInputs = [...inputs];
    newInputs[index] = { ...newInputs[index], [field]: value };
    setInputs(newInputs);
  };

  const addModifier = () => {
    setModifiers([
      ...modifiers,
      {
        name: "",
        type: "select",
        label: "",
        options: [],
      },
    ]);
  };

  const { useSubscriptionStatusQuery } = useSubscription();
  const { data: subscriptionData } = useSubscriptionStatusQuery();

  const { useCastMembersQuery } = useCastMembers();
  const { data: castMemberData } = useCastMembersQuery();

  const userTier = subscriptionData?.tier || "trial";

  const canAccessLevel = (level: 1 | 2 | 3): boolean => {
    if (level === 1 || level === 2) return true; // All tiers can access level 1
    if (level === 3) return userTier === "core" || userTier === "pro";

    return false;
  };

  const removeModifier = (index: number) => {
    setModifiers(modifiers.filter((_, i) => i !== index));
  };

  const updateModifier = (
    index: number,
    field: keyof ModifierField,
    value: string | number | string[]
  ) => {
    const newModifiers = [...modifiers];
    newModifiers[index] = { ...newModifiers[index], [field]: value };
    setModifiers(newModifiers);
  };

  const addCondition = () => {
    setConditions([
      ...conditions,
      {
        field: "",
        operator: "equals",
        value: "",
        action: "",
      },
    ]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (
    index: number,
    field: keyof LogicCondition,
    value: string | number | boolean
  ) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    setConditions(newConditions);
  };

  const addChainingStep = () => {
    setChainingSteps([
      ...chainingSteps,
      {
        name: "",
        promptTemplate: "",
        dependsOn: [],
      },
    ]);
  };

  const removeChainingStep = (index: number) => {
    setChainingSteps(chainingSteps.filter((_, i) => i !== index));
  };

  const updateChainingStep = (
    index: number,
    field: keyof LogicStep,
    value: string | string[]
  ) => {
    const newSteps = [...chainingSteps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setChainingSteps(newSteps);
  };

  const getProtocolType = (
    level: 1 | 2 | 3
  ): "static" | "semi-dynamic" | "compositional" => {
    switch (level) {
      case 1:
        return "static";
      case 2:
        return "semi-dynamic";
      case 3:
        return "compositional";
    }
  };

  // Step 1: Add state to manage saved input names
  const [savedInputs, setSavedInputs] = useState<string[]>([]);

  // Step 2: Function to save input name
  const saveInputName = (name: string) => {
    if (name && !savedInputs.includes(name)) {
      setSavedInputs((prev) => [...prev, name]);
    }
  };

  // Step 3: Function to insert a placeholder into the prompt template
  const insertPlaceholder = (placeholder: string) => {
    const template = promptTemplate || "";
    const insertion = `{${placeholder}}`;
    const updatedTemplate = template.endsWith(" ")
      ? template + insertion
      : template + " " + insertion;
    setPromptTemplate(updatedTemplate.trim());
  };

  const handleSubmit = async () => {
    // Add this validation before saving
    if (!canAccessLevel(currentLevel)) {
      toast({
        title: "Access Restricted",
        description: `Your ${userTier} tier doesn't support Level ${currentLevel} protocols`,
        variant: "destructive",
      });
      return;
    }

    if (!name || !description || !promptTemplate) {
      toast({
        title: "Validation Error",
        description: "Name, description, and prompt template are required.",
        variant: "destructive",
      });
      return;
    }

    // Always include all fields for updates to ensure proper clearing
    const protocolData: CreateProtocolPayload = {
      name,
      description,
      level: currentLevel,
      type: getProtocolType(currentLevel),
      promptTemplate,
      category: category || "General",
      deliveredBy: deliveredBy || undefined,
      // Always send inputs/modifiers arrays - empty for level 1
      inputs: currentLevel >= 2 ? inputs : [],
      modifiers: currentLevel >= 2 ? modifiers : [],
      aiModelId: selectedModelId,
      // Always send logic object - with disabled/empty values for levels 1 & 2
      logic:
        currentLevel === 3
          ? {
            conditions: conditions.length > 0 ? conditions : [],
            iterations: iterationsEnabled
              ? {
                enabled: true,
                maxIterations,
                showProgress,
              }
              : {
                enabled: false,
                maxIterations: 3,
                showProgress: true,
              },
            chaining:
              chainingEnabled && chainingSteps.length > 0
                ? {
                  enabled: true,
                  steps: chainingSteps,
                }
                : {
                  enabled: false,
                  steps: [],
                },
          }
          : {
            conditions: [],
            iterations: {
              enabled: false,
              maxIterations: 3,
              showProgress: true,
            },
            chaining: {
              enabled: false,
              steps: [],
            },
          },
    };

    try {
      if (editingProtocol) {
        // Update existing protocol
        const updatedProtocol = await updateProtocolMutation.mutateAsync({
          id: editingProtocol.id,
          ...protocolData,
        });
        toast({
          title: "Protocol Updated",
          description: `${updatedProtocol.name} has been updated successfully.`,
        });
        onProtocolCreated?.(updatedProtocol);
      } else {
        // Create new protocol
        const newProtocol = await createProtocolMutation.mutateAsync(
          protocolData
        );
        toast({
          title: "Protocol Created",
          description: `${newProtocol.name} has been created successfully.\n Deduction: ${newProtocol.deductedDucks} Ducks.`,
        });

        onProtocolCreated?.(newProtocol);
      }
      setSelectedModelId("");
      resetForm();
      setOpen(false);
      onClose?.();
    } catch (error) {
      // toast({
      //   title: "Error",
      //   description:
      //     error instanceof Error
      //       ? error.message
      //       : `Failed to ${editingProtocol ? "update" : "create"} protocol`,
      //   variant: "destructive",
      // });
    }
  };

  const levelDescriptions = {
    1: "One-button, one-result. Sends a fixed prompt to the AI with no user input or variation.",
    2: "Button opens modal with input fields. Inputs are injected into a templated prompt with basic logic.",
    3: "Fully dynamic prompt generation with modifiers, conditional logic, multiple input types, and Step Chaining.",
  };

  const [exampleModalOpen, setExampleModalOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] glass-tabs">
          <DialogHeader>
            <DialogTitle className="text-color">
              {editingProtocol ? "Edit Protocol" : "Create New Protocol"}
            </DialogTitle>
          </DialogHeader>
          <TooltipProvider delayDuration={0}>
            <ScrollArea className="h-[calc(90vh-150px)] pr-4 relative">


              {currentLevel === 3 && (
                <div className="absolute inset-0 bg-background/20 backdrop-blur-lg z-10 flex items-center justify-center">
                  <div className="text-center p-8  rounded-lg border shadow-lg backdrop-blur-lg">
                    <h3 className="text-xl font-bold mb-2">Level 3 Protocols - Coming Soon! </h3>
                    <p className="text-gray-600 mb-4">
                      Advanced features are in development
                    </p>
                    <Button className="text-white" onClick={() => setCurrentLevel(2)}>
                      Use Level 2 Instead
                    </Button>
                  </div>
                </div>
              )}



              <div className={`space-y-6 ${currentLevel === 3 ? 'blur-sm' : ''}`}>
                {/* Level Selection */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Layers className="h-5 w-5" />
                        Protocol Level
                      </CardTitle>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setExampleModalOpen(true)}
                        className="bg-[rgb(100,55,236)] hover:text-white hover:bg-[rgb(83,31,239)]"
                      >
                        Example
                      </Button>
                    </div>
                    <CardDescription>
                      Choose the complexity level for your protocol
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <Tabs
                      value={currentLevel.toString()}
                      onValueChange={(value) =>
                        setCurrentLevel(parseInt(value) as 1 | 2 | 3)
                      }
                    >
                      <TabsList className="grid w-full grid-cols-3">
                        {[1, 2, 3].map((level) => {
                          const levelNum = level as 1 | 2 | 3;
                          const disabled = !canAccessLevel(levelNum);

                          return (
                            <Tooltip key={levelNum}>
                              <TooltipTrigger asChild>
                                <TabsTrigger
                                  value={levelNum.toString()}
                                  className="flex items-center gap-2"
                                  disabled={disabled}
                                  style={{
                                    backgroundColor:
                                      currentLevel === levelNum
                                        ? "#6436ec"
                                        : undefined,
                                    color:
                                      currentLevel === levelNum
                                        ? "white"
                                        : undefined,
                                    boxShadow:
                                      currentLevel === levelNum
                                        ? "none"
                                        : undefined,
                                  }}
                                >
                                  {levelNum === 1 && (
                                    <Zap className="h-4 w-4" />
                                  )}
                                  {levelNum === 2 && (
                                    <Settings className="h-4 w-4" />
                                  )}
                                  {levelNum === 3 && (
                                    <Layers className="h-4 w-4" />
                                  )}
                                  Level {levelNum}
                                </TabsTrigger>
                              </TooltipTrigger>
                              {disabled && (
                                <TooltipContent>
                                  Upgrade to {levelNum === 2 ? "Core" : "Pro"}{" "}
                                  to unlock Level {levelNum} protocols
                                </TooltipContent>
                              )}
                            </Tooltip>
                          );
                        })}
                      </TabsList>

                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 mt-0.5 text-muted-800" />
                          <div>
                            <Badge variant="outline" className="mb-2">
                              {currentLevel === 1
                                ? "Static Trigger"
                                : currentLevel === 2
                                  ? "Semi-Dynamic Injection"
                                  : "Compositional Protocol Logic"}
                            </Badge>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {levelDescriptions[currentLevel]}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Tabs>
                  </CardContent>
                </Card>
                {/* Prompt Template (All Levels) */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Prompt Template
                      {currentLevel > 1 && savedInputs.length > 0 && (
                        <div className="flex flex-wrap gap-2 max-w-[60%]">
                          {savedInputs.map((inputName) => (
                            <Badge
                              key={inputName}
                              className="cursor-pointer text-xs"
                              onClick={() => insertPlaceholder(inputName)}
                            >
                              {`{${inputName}}`}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="promptTemplate">
                          Prompt Template *
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent side="top" sideOffset={5}>
                            {`Defines the AI’s instructions. Use exact text for Level 1 or {placeholders} for dynamic inputs in Levels 2 and 3. E.g., "Summarize {document} in a {style} tone."`}
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      {/*Icon moved to top-right */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <ClipboardPlus
                            onClick={handlePaste}
                            className="h-5 w-5 text-gray-500 hover:text-indigo-500 cursor-pointer"
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" sideOffset={5}>
                          Paste
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    <Textarea
                      id="promptTemplate"
                      value={promptTemplate}
                      onChange={(e) => setPromptTemplate(e.target.value)}
                      placeholder={
                        currentLevel === 1
                          ? "Enter the exact prompt to send to the AI..."
                          : "Create input fields first. Then click the buttons on the top right to insert those inputs into your prompt. \nExample: Summarize {inputText} in a {style} tone."
                      }
                      rows={4}
                      maxLength={4000}
                      className="glass-search"
                    />
                  </CardContent>
                </Card>

                {/* Level 2 & 3: Inputs */}
                {currentLevel >= 2 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Input Fields
                        <Button onClick={addInput} size="sm" variant="outline">
                          <Plus className="h-1 w-4 mr-4" />
                          Add Input Field
                        </Button>
                      </CardTitle>
                      <CardDescription>
                        Define input fields that users will fill when activating
                        this protocol
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {inputs.length === 0 ? (
                        <p className="text-center py-4 text-gray-600 dark:text-gray-400">
                          No input fields defined. Click "Add Input" to create
                          one.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {inputs.map((input, index) => (
                            <Card key={index} className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium">
                                  Input {index + 1}
                                </h4>
                                <Button
                                  onClick={() => removeInput(index)}
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-500"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Label htmlFor="name">Name</Label>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <HelpCircle className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-pointer" />
                                        </TooltipTrigger>
                                        <TooltipContent
                                          side="top"
                                          sideOffset={5}
                                        >
                                          {`Unique identifier for the input, used as a placeholder in the prompt template (e.g., {inputName}). E.g., "document" for an input where users provide text.`}
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>

                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <ClipboardPlus
                                          onClick={() => handleNamePaste(index)} // pass index of the input
                                          className="h-5 w-5 text-gray-500 hover:text-indigo-500 cursor-pointer"
                                        />
                                      </TooltipTrigger>
                                      <TooltipContent side="top" sideOffset={5}>
                                        Paste
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>

                                  <Input
                                    value={input.name}
                                    onChange={(e) =>
                                      updateInput(index, "name", e.target.value)
                                    }
                                    placeholder="e.g., inputA"
                                    className="glass-search"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Label htmlFor="label">Label</Label>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <HelpCircle className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-pointer" />
                                        </TooltipTrigger>
                                        <TooltipContent
                                          side="top"
                                          sideOffset={5}
                                        >
                                          Display name for the input field in
                                          the user form, enhancing clarity.
                                          E.g., "Document Text" for a text input
                                          field.
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>

                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <ClipboardPlus
                                          onClick={handleLabelPaste}
                                          className="h-5 w-5 text-gray-500 hover:text-indigo-500 cursor-pointer"
                                        />
                                      </TooltipTrigger>
                                      <TooltipContent side="top" sideOffset={5}>
                                        Paste
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>

                                  <Input
                                    value={input.label}
                                    onChange={(e) =>
                                      updateInput(
                                        index,
                                        "label",
                                        e.target.value
                                      )
                                    }
                                    placeholder="e.g., Input A"
                                    className="glass-search"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Label>Type</Label>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-pointer" />
                                      </TooltipTrigger>
                                      <TooltipContent side="top" sideOffset={5}>
                                        Determines the input’s format: Text for
                                        free input, Select for dropdown, Number
                                        for numeric values, or Boolean for
                                        true/false. E.g., "select" for style
                                        options like "formal" or "casual."
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                  <Select
                                    value={input.type}
                                    onValueChange={(value) =>
                                      updateInput(index, "type", value)
                                    }
                                  >
                                    <SelectTrigger className="glass-search">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="glass-drop">
                                      <SelectItem value="text">Text</SelectItem>
                                      <SelectItem value="select">
                                        Select
                                      </SelectItem>
                                      <SelectItem value="number">
                                        Number
                                      </SelectItem>
                                      <SelectItem value="boolean">
                                        Boolean
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Label>Placeholder</Label>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <HelpCircle className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-pointer" />
                                        </TooltipTrigger>
                                        <TooltipContent
                                          side="top"
                                          sideOffset={5}
                                        >
                                          Guides users with example text in the
                                          input field, not used in the AI
                                          prompt. E.g., "Enter your document
                                          here..." for a text input.
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>

                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <ClipboardPlus
                                          onClick={handlePlaceholderPaste}
                                          className="h-5 w-5 text-gray-500 hover:text-indigo-500 cursor-pointer"
                                        />
                                      </TooltipTrigger>
                                      <TooltipContent side="top" sideOffset={5}>
                                        Paste
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>

                                  <Input
                                    value={input.placeholder || ""}
                                    onChange={(e) =>
                                      updateInput(
                                        index,
                                        "placeholder",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Enter placeholder text..."
                                    className="glass-search"
                                  />
                                </div>

                                {input.type === "select" && (
                                  <div className="col-span-2 space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Label>Options (comma-separated)</Label>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <HelpCircle className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-pointer" />
                                        </TooltipTrigger>
                                        <TooltipContent
                                          side="top"
                                          sideOffset={5}
                                        >
                                          List of choices for a Select input,
                                          inserted into the prompt template.
                                          E.g., "formal, casual, technical" for
                                          style options.
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>
                                    <Input
                                      value={input.options?.join(", ") || ""}
                                      onChange={(e) =>
                                        updateInput(
                                          index,
                                          "options",
                                          e.target.value
                                            .split(",")
                                            .map((s) => s.trim())
                                        )
                                      }
                                      placeholder="e.g., option1, option2, option3"
                                    />
                                  </div>
                                )}

                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={input.required}
                                    onCheckedChange={(checked) =>
                                      updateInput(index, "required", checked)
                                    }
                                  />
                                  <div className="flex items-center gap-2">
                                    <Label>Required</Label>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-pointer" />
                                      </TooltipTrigger>
                                      <TooltipContent side="top" sideOffset={5}>
                                        Ensures users must fill this input
                                        before executing the protocol. E.g.,
                                        check for critical inputs like
                                        "document."
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                </div>
                              </div>

                              {/* Save Field Button */}
                              <div className="flex justify-end mt-4">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => saveInputName(input.name)} //  fix here
                                >
                                  Save Field
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="name">Protocol Name *</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent side="top" sideOffset={5}>
                                Identifies the protocol uniquely in the UI. Used
                                as the protocol’s name when executed by the AI.
                                E.g., "Summarize Document" for a protocol that
                                condenses text.
                              </TooltipContent>
                            </Tooltip>
                          </div>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <ClipboardPlus
                                onClick={handleProtocolNamePaste}
                                className="h-5 w-5 text-gray-500 hover:text-indigo-500 cursor-pointer"
                              />
                            </TooltipTrigger>
                            <TooltipContent side="top" sideOffset={5}>
                              Paste
                            </TooltipContent>
                          </Tooltip>
                        </div>

                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g., Reflect Protocol"
                          className="glass-search"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="category">Category</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-pointer" />
                            </TooltipTrigger>
                            <TooltipContent side="top" sideOffset={5}>
                              Organizes the protocol into a category for
                              filtering and display purposes. E.g., "Analysis"
                              for data or text analysis protocols.
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Select value={category} onValueChange={setCategory}>
                          <SelectTrigger className="glass-search">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass-drop">
                            <SelectItem value="General">General</SelectItem>
                            <SelectItem value="Initiation">
                              Initiation
                            </SelectItem>
                            <SelectItem value="Refinement">
                              Refinement
                            </SelectItem>
                            <SelectItem value="Analysis">Analysis</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                            <SelectItem value="Development">
                              Development
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="description">Description *</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-pointer" />
                            </TooltipTrigger>
                            <TooltipContent side="top" sideOffset={5}>
                              Describes the protocol’s purpose, included in the
                              UI and used for context by the AI. E.g.,
                              "Generates a concise summary of a given document."
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        {/*Icon moved to top-right */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <ClipboardPlus
                              onClick={handleDescriptionPaste}
                              className="h-5 w-5 text-gray-500 hover:text-indigo-500 cursor-pointer"
                            />
                          </TooltipTrigger>
                          <TooltipContent side="top" sideOffset={5}>
                            Paste
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe what this protocol does..."
                        rows={3}
                        maxLength={1000}
                        className="glass-search"
                      />
                    </div>

                    {/* <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="deliveredBy">
                            Delivered By (Agent)
                          </Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-pointer" />
                            </TooltipTrigger>
                            <TooltipContent side="top" sideOffset={5}>
                              Specifies the AI agent to execute the protocol.
                              Leave empty to choose any compatible agent. E.g.,
                              "Dax" to assign to the Dax agent.
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>

                      <Select
                        value={deliveredBy}
                        onValueChange={(val) => setDeliveredBy(val)}
                      >
                        <SelectTrigger className="glass-search">
                          <SelectValue placeholder="Select Agent" />
                        </SelectTrigger>
                        <SelectContent className="glass-drop">
                          {castMemberData && castMemberData.length > 0 ? (
                            castMemberData.map((member) => (
                              <SelectItem key={member.id} value={member.name}>
                                <span>{member.name}</span>
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem disabled value="none">
                              No agents available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div> */}

                    {/* <div className=""> */}
                    {/* <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="aiModel">
                            Select AI model{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="top" sideOffset={8}>
                              Choose which AI model this cast member will use.
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div> */}

                    {/*  Dropdown using Select */}
                    {/* <Select value={selectedModelId} onValueChange={(value) => setSelectedModelId(value)}>
                        <SelectTrigger className="glass-search w-full flex justify-between items-center">
                          <SelectValue placeholder="Select AI Model" />
                        </SelectTrigger>
                        <SelectContent className="glass-drop">
                          {isLoading ? (
                            <div className="p-2 text-center">Loading...</div>
                          ) : (
                            modelsArray.map((model) => (
                              <SelectItem key={model.id} value={model.id}>
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center gap-2">
                                    {model.icon && (
                                      <img
                                        src={model.icon}
                                        className="w-5 h-5"
                                        alt={model.displayName}
                                      />
                                    )}
                                    <span>{model.displayName}</span>
                                  </div>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select> */}
                    {/* </div> */}
                  </CardContent>
                </Card>

                {/* Level 2 & 3: Modifiers */}
                {
                  currentLevel >= 2 && ""
                  // <Card>
                  //   <CardHeader>
                  //     <CardTitle className="flex items-center justify-between">
                  //       Modifiers
                  //       <Button onClick={addModifier} size="sm" variant="outline">
                  //         <Plus className="h-4 w-4 mr-1" />
                  //         Add Modifier
                  //       </Button>
                  //     </CardTitle>
                  //     <CardDescription>
                  //       Define optional modifiers that can change the protocol
                  //       behavior
                  //     </CardDescription>
                  //   </CardHeader>
                  //   <CardContent>
                  //     {modifiers.length === 0 ? (
                  //       <p className="text-center py-4 text-sm text-gray-600 dark:text-gray-400">
                  //         No modifiers defined. Click "Add Modifier" to create
                  //         one.
                  //       </p>
                  //     ) : (
                  //       <div className="space-y-4">
                  //         {modifiers.map((modifier, index) => (
                  //           <Card key={index} className="p-4">
                  //             <div className="flex items-center justify-between mb-3">
                  //               <h4 className="font-medium">
                  //                 Modifier {index + 1}
                  //               </h4>
                  //               <Button
                  //                 onClick={() => removeModifier(index)}
                  //                 size="sm"
                  //                 variant="ghost"
                  //                 className="text-red-500"
                  //               >
                  //                 <Trash2 className="h-4 w-4" />
                  //               </Button>
                  //             </div>
                  //             <div className="grid grid-cols-2 gap-3">
                  //               <div className="space-y-2">
                  //                 <div className="flex items-center gap-2">
                  //                   <Label>Name</Label>
                  //                   <Tooltip>
                  //                     <TooltipTrigger asChild>
                  //                       <HelpCircle className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-pointer" />
                  //                     </TooltipTrigger>
                  //                     <TooltipContent side="top" sideOffset={5}>
                  //                       {`Unique identifier for the modifier, used as
                  //                     a placeholder in the prompt template (e.g.,{" "}
                  //                     {modifierName}). E.g., "style" for
                  //                     controlling output tone.`}
                  //                     </TooltipContent>
                  //                   </Tooltip>
                  //                 </div>
                  //                 <Input
                  //                   value={modifier.name}
                  //                   onChange={(e) =>
                  //                     updateModifier(
                  //                       index,
                  //                       "name",
                  //                       e.target.value
                  //                     )
                  //                   }
                  //                   placeholder="e.g., style"
                  //                 />
                  //               </div>
                  //               <div className="space-y-2">
                  //                 <div className="flex items-center gap-2">
                  //                   <Label>Label</Label>
                  //                   <Tooltip>
                  //                     <TooltipTrigger asChild>
                  //                       <HelpCircle className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-pointer" />
                  //                     </TooltipTrigger>
                  //                     <TooltipContent side="top" sideOffset={5}>
                  //                       Display name for the modifier in the user
                  //                       form, clarifying its effect. E.g., "Output
                  //                       Style" for a tone modifier.
                  //                     </TooltipContent>
                  //                   </Tooltip>
                  //                 </div>
                  //                 <Input
                  //                   value={modifier.label}
                  //                   onChange={(e) =>
                  //                     updateModifier(
                  //                       index,
                  //                       "label",
                  //                       e.target.value
                  //                     )
                  //                   }
                  //                   placeholder="e.g., Style Modifier"
                  //                 />
                  //               </div>
                  //               <div className="space-y-2">
                  //                 <div className="flex items-center gap-2">
                  //                   <Label>Type</Label>
                  //                   <Tooltip>
                  //                     <TooltipTrigger asChild>
                  //                       <HelpCircle className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-pointer" />
                  //                     </TooltipTrigger>
                  //                     <TooltipContent side="top" sideOffset={5}>
                  //                       Sets the modifier’s format: Select for
                  //                       options, Toggle for on/off, or Slider for
                  //                       a range. E.g., "toggle" for
                  //                       enabling/disabling features.
                  //                     </TooltipContent>
                  //                   </Tooltip>
                  //                 </div>
                  //                 <Select
                  //                   value={modifier.type}
                  //                   onValueChange={(value) =>
                  //                     updateModifier(index, "type", value)
                  //                   }
                  //                 >
                  //                   <SelectTrigger>
                  //                     <SelectValue />
                  //                   </SelectTrigger>
                  //                   <SelectContent>
                  //                     <SelectItem value="select">
                  //                       Select
                  //                     </SelectItem>
                  //                     <SelectItem value="toggle">
                  //                       Toggle
                  //                     </SelectItem>
                  //                     <SelectItem value="slider">
                  //                       Slider
                  //                     </SelectItem>
                  //                   </SelectContent>
                  //                 </Select>
                  //               </div>
                  //               {modifier.type === "select" && (
                  //                 <div className="space-y-2">
                  //                   <div className="flex items-center gap-2">
                  //                     <Label>Options (comma-separated)</Label>
                  //                     <Tooltip>
                  //                       <TooltipTrigger asChild>
                  //                         <HelpCircle className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-pointer" />
                  //                       </TooltipTrigger>
                  //                       <TooltipContent side="top" sideOffset={5}>
                  //                         List of choices for a Select modifier,
                  //                         affecting AI behavior. E.g., "concise,
                  //                         detailed, creative" for output style.
                  //                       </TooltipContent>
                  //                     </Tooltip>
                  //                   </div>
                  //                   <Input
                  //                     value={modifier.options?.join(", ") || ""}
                  //                     onChange={(e) =>
                  //                       updateModifier(
                  //                         index,
                  //                         "options",
                  //                         e.target.value
                  //                           .split(",")
                  //                           .map((s) => s.trim())
                  //                       )
                  //                     }
                  //                     placeholder="e.g., happy, urgent, professional"
                  //                   />
                  //                 </div>
                  //               )}
                  //               {modifier.type === "slider" && (
                  //                 <>
                  //                   <div className="space-y-2">
                  //                     <div className="flex items-center gap-2">
                  //                       <Label>Min Value</Label>
                  //                       <Tooltip>
                  //                         <TooltipTrigger asChild>
                  //                           <HelpCircle className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-pointer" />
                  //                         </TooltipTrigger>
                  //                         <TooltipContent
                  //                           side="top"
                  //                           sideOffset={5}
                  //                         >
                  //                           Sets the lower bound for a Slider
                  //                           modifier’s range. E.g., "1" for
                  //                           minimum output length in sentences.
                  //                         </TooltipContent>
                  //                       </Tooltip>
                  //                     </div>
                  //                     <Input
                  //                       type="number"
                  //                       value={modifier.min || 0}
                  //                       onChange={(e) =>
                  //                         updateModifier(
                  //                           index,
                  //                           "min",
                  //                           parseInt(e.target.value)
                  //                         )
                  //                       }
                  //                     />
                  //                   </div>
                  //                   <div className="space-y-2">
                  //                     <div className="flex items-center gap-2">
                  //                       <Label>Max Value</Label>
                  //                       <Tooltip>
                  //                         <TooltipTrigger asChild>
                  //                           <HelpCircle className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-pointer" />
                  //                         </TooltipTrigger>
                  //                         <TooltipContent
                  //                           side="top"
                  //                           sideOffset={5}
                  //                         >
                  //                           Sets the upper bound for a Slider
                  //                           modifier’s range. E.g., "10" for
                  //                           maximum output length in sentences.
                  //                         </TooltipContent>
                  //                       </Tooltip>
                  //                     </div>
                  //                     <Input
                  //                       type="number"
                  //                       value={modifier.max || 10}
                  //                       onChange={(e) =>
                  //                         updateModifier(
                  //                           index,
                  //                           "max",
                  //                           parseInt(e.target.value)
                  //                         )
                  //                       }
                  //                     />
                  //                   </div>
                  //                 </>
                  //               )}
                  //             </div>
                  //           </Card>
                  //         ))}
                  //       </div>
                  //     )}
                  //   </CardContent>
                  // </Card>
                }

                {currentLevel === 3 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Advanced Logic</CardTitle>
                      <CardDescription>
                        Configure conditional logic, iterations, and protocol
                        chaining
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <div className="flex items-center space-x-2 mb-3">
                          <Switch
                            checked={iterationsEnabled}
                            onCheckedChange={setIterationsEnabled}
                          />
                          <div className="flex items-center gap-2">
                            <Label>Enable Iterations</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent side="top" sideOffset={5}>
                                Allows the AI to run the protocol multiple times
                                to refine output. E.g., enable to iteratively
                                improve a summary.
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                        {iterationsEnabled && (
                          <div className="grid grid-cols-2 gap-3 ml-6">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label>Max Iterations</Label>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-pointer" />
                                  </TooltipTrigger>
                                  <TooltipContent side="top" sideOffset={5}>
                                    Limits the number of protocol runs to
                                    prevent excessive processing. E.g., "3" for
                                    up to three refinements.
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <Input
                                type="number"
                                value={maxIterations}
                                onChange={(e) =>
                                  setMaxIterations(parseInt(e.target.value))
                                }
                                min={1}
                                max={10}
                                className="glass-search"
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={showProgress}
                                onCheckedChange={setShowProgress}
                              />
                              <div className="flex items-center gap-2">
                                <Label>Show Progress</Label>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-pointer" />
                                  </TooltipTrigger>
                                  <TooltipContent side="top" sideOffset={5}>
                                    Displays intermediate outputs to users
                                    during iterative execution. E.g., check to
                                    show each refinement step.
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <Separator />

                      <div>
                        <div className="flex items-center space-x-2 mb-3">
                          <Switch
                            checked={chainingEnabled}
                            onCheckedChange={setChainingEnabled}
                          />
                          <div className="flex items-center gap-2">
                            <Label>Enable Step Chaining</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent side="top" sideOffset={5}>
                                Enables a sequence of steps where each step’s
                                output feeds the next. E.g., enable to
                                summarize, then translate, then format.
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                        {chainingEnabled && (
                          <div className="ml-6">
                            <div className="flex items-center justify-between mb-3">
                              <Label>Chaining Steps</Label>
                              <Button
                                onClick={addChainingStep}
                                size="sm"
                                variant="outline"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Step
                              </Button>
                            </div>
                            {chainingSteps.map((step, index) => (
                              <Card key={index} className="p-3 mb-3">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-medium">
                                    Step {index + 1}
                                  </h5>
                                  <Button
                                    onClick={() => removeChainingStep(index)}
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-500"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div>
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Label>Step Name</Label>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-pointer" />
                                          </TooltipTrigger>
                                          <TooltipContent
                                            side="top"
                                            sideOffset={5}
                                          >
                                            Identifies the chaining step,
                                            describing its role in the sequence.
                                            E.g., "Summarization Step" for the
                                            first step.
                                          </TooltipContent>
                                        </Tooltip>
                                      </div>

                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <ClipboardPlus
                                            onClick={() =>
                                              handleStepNamePaste(index)
                                            }
                                            className="h-5 w-5 text-gray-500 hover:text-indigo-500 cursor-pointer"
                                          />
                                        </TooltipTrigger>
                                        <TooltipContent
                                          side="top"
                                          sideOffset={5}
                                        >
                                          Paste
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>

                                    <Input
                                      value={step.name}
                                      onChange={(e) =>
                                        updateChainingStep(
                                          index,
                                          "name",
                                          e.target.value
                                        )
                                      }
                                      placeholder="e.g., Refinement Step 1"
                                      className="glass-search"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Label>Prompt Template</Label>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-pointer" />
                                          </TooltipTrigger>
                                          <TooltipContent
                                            side="top"
                                            sideOffset={5}
                                          >
                                            {`Defines the AI’s task for this chaining step, using placeholders for prior outputs or inputs. E.g., "Translate {previousOutput} into Spanish."`}
                                          </TooltipContent>
                                        </Tooltip>
                                      </div>

                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <ClipboardPlus
                                            onClick={() =>
                                              handleStepPromptTemplatePaste(
                                                index
                                              )
                                            }
                                            className="h-5 w-5 text-gray-500 hover:text-indigo-500 cursor-pointer"
                                          />
                                        </TooltipTrigger>
                                        <TooltipContent
                                          side="top"
                                          sideOffset={5}
                                        >
                                          Paste
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>

                                    <Textarea
                                      value={step.promptTemplate}
                                      onChange={(e) =>
                                        updateChainingStep(
                                          index,
                                          "promptTemplate",
                                          e.target.value
                                        )
                                      }
                                      placeholder="e.g., Refine the following text..."
                                      rows={2}
                                      maxLength={1000}
                                      className="glass-search"
                                    />
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </TooltipProvider>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="text-color"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                createProtocolMutation.isPending ||
                updateProtocolMutation.isPending
              }
              className=" bg-gradient-to-r from-indigo-500/80 to-purple-500/80 
    text-white font-medium shadow-[inset_1px_1px_6px_rgba(255,255,255,0.6),inset_-2px_-2px_6px_rgba(0,0,0,0.15)]
    hover:shadow-[0_0_12px_rgba(131,113,243,0.8),inset_1px_1px_6px_rgba(255,255,255,0.6)]
    border-[3px] border-white/50
    backdrop-blur-3xl"
            >
              {editingProtocol
                ? updateProtocolMutation.isPending
                  ? "Updating..."
                  : "Update Protocol"
                : createProtocolMutation.isPending
                  ? "Creating..."
                  : "Create Protocol"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={exampleModalOpen} onOpenChange={setExampleModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-color">Example for Level {currentLevel}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {currentLevel === 1 && (
              <>
                <Card>
                  <CardContent className="space-y-2 py-4">
                    <h3 className="font-semibold text-lg">
                      🔹 What Are Protocols?
                    </h3>
                    <p>
                      Protocols are pre-set commands you build using a guided
                      menu. Think of them like tools in your digital
                      toolbox—each one tells your AI cast member exactly what to
                      do when you click it. No typing needed. No decisions. Just
                      action.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="space-y-2 py-4">
                    <h3 className="font-semibold text-lg">
                      🔹 Level 1 Protocol (Static Trigger)
                    </h3>
                    <p>
                      <strong>Purpose:</strong> One-click productivity. Level 1
                      is the simplest form of a protocol:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>You create a fixed instruction.</li>
                      <li>
                        You assign it to a cast member (or leave it open).
                      </li>
                      <li>You click a button.</li>
                      <li>It runs instantly, the same way every time.</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="space-y-2 py-4">
                    <h3 className="font-semibold text-lg">
                      🔹 Customizing a Protocol
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        <strong>Protocol Name:</strong> What do you want to call
                        it? This appears on your button.
                      </li>
                      <li>
                        <strong>Category:</strong> Group it for clarity.
                        Categories like “Thinking,” “Workflow,” or “Writing.”
                      </li>
                      <li>
                        <strong>Description:</strong> This is shown to remind
                        you what the button does.
                      </li>
                      <li>
                        <strong>Delivered By (Agent):</strong> Choose a specific
                        cast member like Dax, Hollis, or your own creation.
                        Leave blank for any.
                      </li>
                      <li>
                        <strong>Prompt Template:</strong> This is the core
                        instruction. When you press the button, this is what
                        runs.
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Template Cards */}
                <Card>
                  <CardContent className="space-y-1 py-4">
                    <h4 className="font-semibold text-md">
                      🔸 Reflect Protocol
                    </h4>
                    <p>
                      <strong>Category:</strong> Self-Review
                    </p>
                    <p>
                      <strong>Description:</strong> Quickly reviews what just
                      happened and redirects your focus.
                    </p>
                    <p>
                      <strong>Delivered By (Agent):</strong> Dax (or any
                      logic-driven cast member)
                    </p>
                    <p>
                      <strong>Prompt Template:</strong>
                    </p>
                    <pre className="whitespace-pre-wrap text-sm bg-muted p-2 rounded">
                      Analyze and review the last 6 interactions that happened
                      between the operator and Cast Member. Provide a short
                      summary of what seemed to have happened. Provide a short
                      summary of a psychological analysis of what occurred.
                      Refocus operator to the last task or priority.
                    </pre>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="space-y-1 py-4">
                    <h4 className="font-semibold text-md">
                      🔸 Confirm Protocol
                    </h4>
                    <p>
                      <strong>Category:</strong> Fact-Check
                    </p>
                    <p>
                      <strong>Description:</strong> Helps stop indecision by
                      fact-checking your own or the AI's claims.
                    </p>
                    <p>
                      <strong>Delivered By (Agent):</strong> Reverse-Dax (or any
                      critically analytical agent)
                    </p>
                    <p>
                      <strong>Prompt Template:</strong>
                    </p>
                    <pre className="whitespace-pre-wrap text-sm bg-muted p-2 rounded">
                      Review the last 2 interactions both the Operator and Cast
                      Member had, and search for sources of information online
                      that provide proof or disprove any claims that might be
                      done by the operator or cast member.
                    </pre>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="space-y-1 py-4">
                    <h4 className="font-semibold text-md">
                      🔸 Inspire Me Protocol
                    </h4>
                    <p>
                      <strong>Category:</strong> Motivation
                    </p>
                    <p>
                      <strong>Description:</strong> Lifts your spirit with
                      timely, personal inspiration.
                    </p>
                    <p>
                      <strong>Delivered By (Agent):</strong> Leo (or any
                      encouraging/creative agent)
                    </p>
                    <p>
                      <strong>Prompt Template:</strong>
                    </p>
                    <pre className="whitespace-pre-wrap text-sm bg-muted p-2 rounded">
                      Analyze the last 4 interactions between operator and cast
                      member and provide the operator with an appropriate short
                      story or inspirational phrase that is relevant to the
                      operator to motivate them forward.
                    </pre>
                  </CardContent>
                </Card>
              </>
            )}

            {currentLevel === 2 && (
              <div className="space-y-4">
                <Card>
                  <CardContent className="space-y-2 py-4">
                    <h3 className="font-semibold text-lg">
                      🔹 What Are Protocols?
                    </h3>
                    <p>
                      Protocols are pre-set commands you build using a guided
                      menu. Think of them like tools in your digital
                      toolbox—each one tells your AI cast member exactly what to
                      do when you click it. No typing needed. No decisions. Just
                      action.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="space-y-2 py-4">
                    <h3 className="font-semibold text-lg">
                      🔹 What Is a Level 2 Protocol?
                    </h3>
                    <p>
                      Level 2 Protocols are semi-dynamic tools. They offer more
                      flexibility than Level 1 by allowing you to add custom
                      input fields that get injected into your prompt before it
                      runs. This lets you reuse the same logic across different
                      tasks while keeping control over key variables.
                    </p>
                    <p>
                      Think of it like filling in the blanks before you launch a
                      predefined system.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="space-y-2 py-4">
                    <h3 className="font-semibold text-lg">🔹 How It Works</h3>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        You design a prompt template using placeholders like{" "}
                        <code>{`{taskName}`}</code> or <code>{`{style}`}</code>.
                      </li>
                      <li>
                        When triggered, a modal appears asking the user to fill
                        out these inputs.
                      </li>
                      <li>
                        The AI then runs the complete prompt with your custom
                        values filled in.
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="space-y-2 py-4">
                    <h3 className="font-semibold text-lg">
                      🔹 Example Use Cases
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        <strong>"Evolve Text"</strong> protocol
                        <br />
                        <span className="text-muted-foreground">
                          <em>Instruction →</em> Take the input text, scan it
                          for errors, typos and formatting opportunities, then
                          apply all suggestions and fixes, then provide the
                          before and after.
                        </span>
                      </li>
                      <li>
                        <strong>"Distill Protocol"</strong>
                        <br />
                        <span className="text-muted-foreground">
                          <em>Instruction →</em> Receive the input text and
                          distill it into actionable steps and key insights. You
                          can also change categories (e.g., distill insight from
                          a situation or extract a list of steps to follow).
                        </span>
                      </li>
                      <li>
                        <strong>"Action List"</strong> protocol
                        <br />
                        <span className="text-muted-foreground">
                          <em>Instruction →</em> Take the input text and distill
                          everything into a short list of actionable things.
                          Organize from least difficulty to most.
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}

            {currentLevel === 3 && (
              <div className="space-y-4">
                {/* What Are Protocols */}
                <Card>
                  <CardContent className="space-y-2 py-4">
                    <h3 className="font-semibold text-lg">
                      🔹 What Are Protocols?
                    </h3>
                    <p>
                      Protocols are pre-set commands you build using a guided
                      menu. Think of them like tools in your digital
                      toolbox—each one tells your AI cast member exactly what to
                      do when you click it. No typing needed. No decisions. Just
                      action.
                    </p>
                  </CardContent>
                </Card>

                {/* What Is a Level 3 Protocol */}
                <Card>
                  <CardContent className="space-y-2 py-4">
                    <h3 className="font-semibold text-lg">
                      🔹 What Is a Level 3 Protocol?
                    </h3>
                    <p>
                      Level 3 Protocols are the most advanced type of
                      interaction in the DisruptiveDuckAI system. They allow
                      chained steps, recursive iterations, and future support
                      for conditional branching, making them ideal for
                      multi-stage reasoning, refinement cycles, or decision
                      trees.
                    </p>
                    <p>
                      Where Level 1 is instant and Level 2 is semi-dynamic,
                      Level 3 is structured logic in motion.
                    </p>
                  </CardContent>
                </Card>

                {/* Core Capabilities */}
                <Card>
                  <CardContent className="space-y-2 py-4">
                    <h3 className="font-semibold text-lg">
                      🔹 Core Capabilities
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        <strong>Step Chaining</strong> – Define a sequence of
                        steps that run back-to-back, each using the previous
                        output.
                      </li>
                      <li>
                        <strong>Iterations</strong> – Repeat a single prompt
                        multiple times to evolve or refine the result. Great for
                        writing drafts, optimization, or creative mutation.
                      </li>
                      <li>
                        <strong>(Coming Soon)</strong> Instruction menus for
                        iterations – Let users define different behavior per
                        step (e.g., Step 1 = Expand, Step 2 = Reword, Step 3 =
                        Polish).
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Current Setup Options */}
                <Card>
                  <CardContent className="space-y-2 py-4">
                    <h3 className="font-semibold text-lg">
                      🔹 Current Setup Options
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        <strong>Enable Iterations</strong> – Allows a single
                        prompt to repeat itself for a given number of times (Max
                        Iterations). You can also show progress so the user can
                        track it.
                      </li>
                      <li>
                        <strong>Enable Step Chaining</strong> – Build a linear
                        chain of multiple custom steps. Each step includes:
                        <ul className="list-disc list-inside pl-4 mt-1 space-y-1">
                          <li>
                            <strong>Step Name</strong> – Helps label what’s
                            happening (e.g., "Refine for tone").
                          </li>
                          <li>
                            <strong>Prompt Template</strong> – Define the action
                            to perform at that stage.
                          </li>
                        </ul>
                      </li>
                    </ul>
                    <p className="text-sm italic">Future updates will allow:</p>
                    <ul className="list-disc list-inside pl-4 space-y-1 text-sm">
                      <li>Per-step agent assignment</li>
                      <li>Conditional jumps or fork logic</li>
                      <li>Memory/variable injection from prior steps</li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Example Use Cases */}
                <Card>
                  <CardContent className="space-y-2 py-4">
                    <h3 className="font-semibold text-lg">
                      🔹 Example Use Cases
                    </h3>

                    {/* Polish Draft Protocol */}
                    <div className="space-y-1">
                      <p>
                        <strong>🔸 Polish Draft Protocol</strong>
                      </p>
                      <p className="pl-4">
                        Use: Refine written input across 3 rounds
                      </p>
                      <ul className="list-disc list-inside pl-6 space-y-1">
                        <li>Improve clarity</li>
                        <li>Adjust tone to target audience</li>
                        <li>Add finishing polish and formatting</li>
                      </ul>
                    </div>

                    {/* Product Generator Chain */}
                    <div className="space-y-1">
                      <p>
                        <strong>🔸 Product Generator Chain</strong>
                      </p>
                      <p className="pl-4">
                        Use: Turn an idea into a full product concept
                      </p>
                      <ul className="list-disc list-inside pl-6 space-y-1">
                        <li>Describe the idea</li>
                        <li>Generate 3 product variations</li>
                        <li>Identify pros/cons of each</li>
                        <li>Select best one and refine</li>
                      </ul>
                    </div>

                    {/* Argument Builder */}
                    <div className="space-y-1">
                      <p>
                        <strong>🔸 Argument Builder</strong>
                      </p>
                      <p className="pl-4">
                        Use: Generate and test logical arguments
                      </p>
                      <ul className="list-disc list-inside pl-6 space-y-1">
                        <li>State thesis</li>
                        <li>Build supporting logic</li>
                        <li>Add counterarguments</li>
                        <li>Refine into a persuasive structure</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
