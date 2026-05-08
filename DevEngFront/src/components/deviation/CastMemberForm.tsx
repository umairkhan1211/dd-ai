import { useState, ChangeEvent, FormEvent, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Check, ChevronDown, ClipboardPlus, HelpCircle } from "lucide-react";
import { CastMemberType } from "./CastMemberCard";
import avatar from "@/assets/Avatar/default-avatar.webp";
import { useAiModels } from "@/services/aiModelService";

import chatgpt from "@/assets/ai-icons/chatgpt.png";
import claud from "@/assets/ai-icons/claud.png";
import gemini from "@/assets/ai-icons/gemini.png";
import perplexity from "@/assets/ai-icons/perplexity.png";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export type CastMemberFormValues = Omit<CastMemberType, "id"> & {
  newInvocationPhrase?: string;
};

export type SubmitCastMemberData = Omit<CastMemberType, "id">;

interface CastMemberFormProps {
  initialData?: Partial<CastMemberType>;
  onSubmit: (data: SubmitCastMemberData) => void;
  isSubmitting?: boolean;
}

const defaultFormValues: CastMemberFormValues = {
  instruction: "",
  name: "",
  functionalRole: "",
  description: "",
  defaultTone: "",
  avatar: avatar,
};

export function CastMemberForm({
  initialData,
  onSubmit,
  isSubmitting,
}: CastMemberFormProps) {
  const { data: aiModelsResponse, isLoading } = useAiModels();
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [formValues, setFormValues] = useState<CastMemberFormValues>(defaultFormValues);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const modelsArray = aiModelsResponse?.data;

  const modelIcons: Record<string, string> = {
    "gpt-4o-mini": chatgpt,
    "claude": claud,
    "gemini": gemini,
    "perplexity": perplexity,
  };

  useEffect(() => {
    if (!modelsArray || modelsArray.length === 0) return;

    // Find GPT-4o model
    const gpt4oModel = modelsArray.find(model => model.displayName === "GPT-4o Mini");

    // Default model ID: GPT-4o if exists, else first model
    const defaultModelId = gpt4oModel ? gpt4oModel.id : modelsArray[0].id;

    // Set form values
    setFormValues({
      instruction: initialData?.instruction || "",
      name: initialData?.name || "",
      functionalRole: initialData?.functionalRole || "",
      description: initialData?.description || "",
      defaultTone: initialData?.defaultTone || "",
      avatar: initialData?.avatar || "",
    });

    // Set selected model: initialData.aiModelId if exists, else default
    setSelectedModelId(initialData?.aiModelId || defaultModelId);

  }, [modelsArray, initialData]);


  const handleInstructionPaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      setFormValues((prev) => ({
        ...prev,
        instruction: prev.instruction + clipText,
      }));
    } catch (err) {
      console.error("Clipboard read failed:", err);
    }
  };

  const handleNamePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      setFormValues((prev) => ({
        ...prev,
        name: prev.name + clipText,
      }));
    } catch (err) {
      console.error("Clipboard read failed:", err);
    }
  };

  const handleFunctionalRolePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      setFormValues((prev) => ({
        ...prev,
        functionalRole: prev.functionalRole + clipText,
      }));
    } catch (err) {
      console.error("Clipboard read failed:", err);
    }
  };

  const handleDefaultTonePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      setFormValues((prev) => ({
        ...prev,
        defaultTone: prev.defaultTone + clipText,
      }));
    } catch (err) {
      console.error("Clipboard read failed:", err);
    }
  };

  const handleDescriptionPaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      setFormValues((prev) => ({
        ...prev,
        description: prev.description + clipText,
      }));
    } catch (err) {
      console.error("Clipboard read failed:", err);
    }
  };



  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: name === "priority" ? parseInt(value, 10) || 0 : value,
    }));
  };



  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const { newInvocationPhrase, ...castMemberData } = formValues;

    const payload: SubmitCastMemberData = {
      ...castMemberData,
      aiModelId: selectedModelId,
      avatar: avatarFile || formValues.avatar, // must always be defined
    };

    onSubmit(payload);
  };




  const { toast } = useToast();

  // helper fn
  const fileToBase64 = (file: File) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleAvatarSelect = (src: string) => {
    setFormValues((prev) => ({
      ...prev,
      avatar: src,
    }));
  };

  return (
    <TooltipProvider delayDuration={0}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative flex items-center justify-center">
          {/* Background Circles */}
          <div className="circle circle-1"></div>


          <Card className="relative z-10 EnterInstructions w-full glass-tabs-i border border-border shadow-md rounded-lg">
            <CardHeader className="">
              <CardTitle className=" relative z-20 text-lg font-semibold font-ubuntu ">
                Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="instruction font-ubuntu">Actions/Instructions</Label>
                    <Tooltip >
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={8} className="font-ubuntu">
                        Defines what the AI agent should do — its skills, task
                        focus, or domain expertise. For example: answer factually,
                        write code, give financial advice, or increase
                        productivity.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <ClipboardPlus
                        onClick={handleInstructionPaste}
                        className="h-5 w-5 text-gray-500 hover:text-gray-100 cursor-pointer"
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={5}>
                      Paste
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Textarea
                  id="instruction"
                  name="instruction"
                  value={formValues.instruction}
                  onChange={handleChange}
                  placeholder="e.g., Answer all questions with factual accuracy. Help me write and debug Python code. Give financially sound advice. Focus on boosting my daily productivity."
                  rows={3}
                  maxLength={1000}
                  className="font-ubuntu"

                />
              </div>
            </CardContent>
          </Card>

        </div>

        <div className="relative">
          <div className="circle circle-2"></div>

          <Card className="EnterAvatar glass-tabs-i border border-border shadow-md rounded-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold font-ubuntu">Avatar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="font-ubuntu">
                    Choose an Avatar <span className="text-destructive">*</span>
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={8}>
                      Select a default avatar from our gallery or upload your own
                      image.
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Avatar Preview (Default or Selected) */}
                <div className="flex items-center justify-center">
                  <div
                    className="w-32 h-32 rounded-full border overflow-hidden shadow-md cursor-pointer hover:opacity-80 transition"
                    onClick={() =>
                      document.getElementById("avatarUpload")?.click()
                    }
                  >
                    <img
                      src={formValues.avatar.toString() || avatar}
                      alt="Avatar Preview"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </div>

                {/* Hidden File Input */}
                <input
                  id="avatarUpload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // check file size (bytes -> MB)
                      if (file.size > 4 * 1024 * 1024) {
                        toast({
                          title:
                            "Image size should not exceed 4MB. Please select a smaller file.",
                          variant: "destructive",
                        });
                        e.target.value = "";
                        document.getElementById("avatarUpload")?.click();
                        return;
                      }

                      // check dimensions (max 1000x1000)
                      const img = new Image();
                      img.src = URL.createObjectURL(file);
                      img.onload = () => {
                        if (img.width > 1000 || img.height > 1000) {
                          toast({
                            title:
                              "Image dimensions should not exceed 1000 x 1000 pixels.",
                          });
                          e.target.value = "";
                          document.getElementById("avatarUpload")?.click();
                          return;
                        }

                        setAvatarFile(file);
                        handleAvatarSelect(URL.createObjectURL(file));
                      };
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className={`relative ${dropdownOpen ? 'z-20' : 'z-0'}`}>
          <div className="circle circle-3"></div>



          <Card className=" EnterYourDetail glass-tabs-i border border-border shadow-md rounded-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Identity & Personality
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="name">
                        Name <span className="text-destructive">*</span>
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" sideOffset={8}>
                          The unique name of the cast member, shown in AI
                          responses.
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <ClipboardPlus
                          onClick={handleNamePaste}
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
                    name="name"
                    value={formValues.name}
                    onChange={handleChange}
                    placeholder="e.g., Dax"
                    required
                    className="glass-search"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="functionalRole">
                        Functional Role{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" sideOffset={8}>
                          The role or expertise of the cast member, guiding the
                          AI’s response style.
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <ClipboardPlus
                          onClick={handleFunctionalRolePaste}
                          className="h-5 w-5 text-gray-500 hover:text-indigo-500 cursor-pointer"
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={5}>
                        Paste
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <Input
                    id="functionalRole"
                    name="functionalRole"
                    value={formValues.functionalRole}
                    onChange={handleChange}
                    placeholder="e.g., Logic Strategist"
                    required
                    className="glass-search"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="defaultTone">
                      Default Tone <span className="text-destructive">*</span>
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={8}>
                        The tone of the cast member’s responses, like formal or
                        friendly.
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <ClipboardPlus
                        onClick={handleDefaultTonePaste}
                        className="h-5 w-5 text-gray-500 hover:text-indigo-500 cursor-pointer"
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={5}>
                      Paste
                    </TooltipContent>
                  </Tooltip>
                </div>

                <Input
                  id="defaultTone"
                  name="defaultTone"
                  value={formValues.defaultTone}
                  onChange={handleChange}
                  placeholder="e.g., Precise, direct"
                  required
                  className="glass-search"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="aiModel">
                      Select AI model <span className="text-destructive">*</span>
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
                </div>

                {/*  Dropdown using Select */}
                <Select
                  value={selectedModelId}
                  onValueChange={(value) => setSelectedModelId(value)}
                >
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
                </Select>
              </div>


              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={8}>
                        A description of the cast member’s purpose or behavior.
                      </TooltipContent>
                    </Tooltip>
                  </div>

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
                  name="description"
                  value={formValues.description}
                  onChange={handleChange}
                  placeholder="Describe how the character behaves (e.g., jokes often, keeps things light, and uses humor to ease tension)."
                  rows={3}
                  maxLength={1000}
                  className="glass-search"
                />
              </div>
            </CardContent>
          </Card>
        </div>


        <div className="flex justify-end">
          <Button
            className="CreateCastMember  bg-gradient-to-r from-indigo-500/80 to-purple-500/80 
    text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(255,255,255,0.3),0_2px_6px_rgba(0,0,0,0.4)]
      hover:shadow-[0_0_12px_rgba(131,113,243,0.8),inset_1px_1px_6px_rgba(255,255,255,0.6)]
    border-[1px] border-white/50
    backdrop-blur-3xl
    transition duration-300 ease-out"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? initialData
                ? "Updating..."
                : "Creating..."
              : initialData
                ? "Update Cast Member"
                : "Create Cast Member"}
          </Button>
        </div>
      </form>
    </TooltipProvider >
  );
}

