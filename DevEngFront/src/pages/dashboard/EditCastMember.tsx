import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, X, Loader2, HelpCircle, Check, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCastMembers } from "@/hooks/use-cast-members";
import { UpdateCastMemberPayload } from "@/services/castMemberService";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

import { useAiModels } from "@/services/aiModelService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EditCastMember = () => {
  const { castMemberId } = useParams<{ castMemberId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { useCastMemberQuery, useUpdateCastMember } = useCastMembers();

  const { data: aiModelsResponse, isLoading } = useAiModels();

  const aiModelsList = aiModelsResponse?.data;

  // Keep selected id (what backend expects)
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const {
    data: castMember,
    isLoading: isLoadingCastMember,
    isError,
    error,
  } = useCastMemberQuery(castMemberId);
  const updateCastMemberMutation = useUpdateCastMember();

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  const [formDataState, setFormDataState] = useState<Partial<UpdateCastMemberPayload>>({
    name: "",
    functionalRole: "",
    defaultTone: "",
    description: "",
    invocationPhrases: [],
    priority: 0,
  });
  const [newInvocationPhrase, setNewInvocationPhrase] = useState("");

  useEffect(() => {
    if (castMember) {
      setFormDataState((prev) => ({
        ...prev,
        name: castMember.name,
        functionalRole: castMember.functionalRole,
        defaultTone: castMember.defaultTone,
        description: castMember.description || "",
        invocationPhrases: castMember.invocationPhrases || []
      }));

      // set avatar
      if (castMember.avatar) {
        setAvatarPreview(typeof castMember.avatar === "string"
          ? castMember.avatar
          : URL.createObjectURL(castMember.avatar));
      }

      // set selected AI model
      setSelectedModelId(castMember.aiModelId || aiModelsList[0]?.id || "");
    }
  }, [castMember, aiModelsList]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        toast({
          title: "Image size should not exceed 4MB. Please select a smaller file.",
        });
        e.target.value = "";
        return;
      }

      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        if (img.width > 1000 || img.height > 1000) {
          toast({
            title: "Image dimensions should not exceed 1000 x 1000 pixels.",
            variant: "destructive",
          });
          e.target.value = "";
          return;
        }

        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
      };
    }
  };

  const fileToBase64 = (file: File) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormDataState((prev) => ({
      ...prev,
      [name]: name === "priority" ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleAddInvocationPhrase = () => {
    if (newInvocationPhrase.trim() !== "") {
      setFormDataState((prev) => ({
        ...prev,
        invocationPhrases: [...(prev.invocationPhrases || []), newInvocationPhrase.trim()],
      }));
      setNewInvocationPhrase("");
    }
  };

  const handleRemoveInvocationPhrase = (phrase: string) => {
    setFormDataState((prev) => ({
      ...prev,
      invocationPhrases: (prev.invocationPhrases || []).filter((p) => p !== phrase),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!castMemberId) {
      toast({
        title: "Error",
        description: "Cast Member ID is missing.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("id", castMemberId);
    formData.append("name", formDataState.name || "");
    formData.append("functionalRole", formDataState.functionalRole || "");
    formData.append("defaultTone", formDataState.defaultTone || "");
    formData.append("description", formDataState.description || "");
    formData.append("priority", String(formDataState.priority || 0));

    if (formDataState.invocationPhrases?.length) {
      formDataState.invocationPhrases.forEach((p) =>
        formData.append("invocationPhrases[]", p)
      );
    }

    if (avatarFile) {
      const base64 = (await fileToBase64(avatarFile)) as string;
      formData.append("avatar", base64);
    } else if (castMember?.avatar) {
      formData.append("avatar", castMember.avatar as string);
    }

    formData.append("aiModelId", selectedModelId);
    try {
      await updateCastMemberMutation.mutateAsync({
        id: castMemberId,
        name: formDataState.name,
        functionalRole: formDataState.functionalRole,
        defaultTone: formDataState.defaultTone,
        description: formDataState.description,
        priority: formDataState.priority,
        invocationPhrases: formDataState.invocationPhrases,
        avatar: avatarFile || castMember.avatar,
        aiModelId: selectedModelId
      });
      toast({ title: "Cast Member updated successfully" });
      navigate("/dashboard/cast-members");
    } catch (err) {
      console.error("Failed to update cast member:", err);
      toast({ title: "Update failed", variant: "destructive" });
    }
  };


  if (isLoadingCastMember) {
    return (
      <DashboardLayout>
        <div className="p-6 flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-color">Loading cast member...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !castMember) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Error Loading Cast Member</h1>
          <p className="mb-4">
            {error?.message || "The cast member you are looking for does not exist or could not be loaded."}
          </p>
          <Button onClick={() => navigate("/dashboard/cast-members")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cast Members
          </Button>
        </div>
      </DashboardLayout>
    );
  }


  return (
    <DashboardLayout>
      <div
        className="
    flex flex-col sm:flex-row 
    items-center sm:items-center 
    justify-start sm:justify-start 
    gap-3 sm:gap-5 
    px-4 sm:px-6 md:px-8 
    py-4 sm:py-6 md:py-8 
    w-full
    z-10
  "
      >
        {/* 🔹 Back Button */}
        <button
          onClick={() => navigate('/dashboard/cast-members')}
          className="
      flex items-center justify-center
      border border-gray-600 hover:border-gray-200
      rounded-full px-4 py-2 
      text-sm sm:text-base font-medium text-color 
      transition duration-200 ease-in-out
      w-full sm:w-auto
    "
        >
          <ArrowLeft className="h-4 w-4 mr-2 text-color" />
          Back
        </button>

        {/* 🔹 Title */}
        <h1
          className="
      text-2xl sm:text-3xl md:text-4xl 
      font-bold text-color 
      text-center sm:text-left
      w-full sm:w-auto
    "
        >
          Edit Cast Member
        </h1>
      </div>


      <div className="container max-w-3xl py-8">
        <TooltipProvider delayDuration={0}>
          <form onSubmit={handleSubmit} className="space-y-8 glass-tabs p-6">
            <div className="space-y-6 rounded-lg shadow">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold font-ubuntu">Edit "{castMember.name}"</h2>
                <p className="text-muted-foreground font-ubuntu">Update this cast member's details.</p>
              </div>

              {/* Avatar */}
              <div className="space-y-2">
                <Label className="font-ubuntu">Profile Avatar</Label>
                <div className="flex justify-center items-center">

                  <div
                    className="w-32 h-32  rounded-full border overflow-hidden shadow-md cursor-pointer hover:opacity-80 transition"
                    onClick={() => document.getElementById("avatarUpload")?.click()}
                  >
                    <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                  </div>
                </div>
                <input id="avatarUpload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>

              {/* Grid fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={8}>
                        The unique name of the cast member, shown in AI responses.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input id="name" name="name" value={formDataState.name || ""} onChange={handleChange} placeholder="e.g., Dax" required className="glass-search" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="functionalRole">Functional Role <span className="text-destructive">*</span></Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={8}>
                        The role or expertise of the cast member, guiding the AI’s response style.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input id="functionalRole" name="functionalRole" value={formDataState.functionalRole || ""} onChange={handleChange} placeholder="e.g., Logic Strategist" required className="glass-search" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="defaultTone">Default Tone <span className="text-destructive">*</span></Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={8}>
                        The tone of the cast member’s responses, like formal or friendly.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input id="defaultTone" name="defaultTone" value={formDataState.defaultTone || ""} onChange={handleChange} placeholder="e.g., Precise, direct" required className="glass-search" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={8}>
                        The priority level for selecting this cast member (higher is prioritized).
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input id="priority" name="priority" type="number" value={formDataState.priority || 0} onChange={handleChange} placeholder="e.g., 0" min={0} required className="glass-search" />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
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
                <Textarea id="description" name="description" value={formDataState.description || ""} onChange={handleChange} placeholder="Describe how the character behaves..." rows={4} maxLength={1000} className="glass-search" />
              </div>

              {/* AI Model dropdown (shows name+icon but stores id) */}
              <div className="space-y-2">
                <Label>Select AI Model <span className="text-destructive">*</span></Label>

                <Select
                  value={selectedModelId}
                  onValueChange={(value) => setSelectedModelId(value)}
                >
                  <SelectTrigger className="w-full flex justify-between items-center p-2 glass-search">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>

                  <SelectContent className="glass-drop max-h-60 overflow-auto">
                    {aiModelsList.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            {model.icon && (
                              <img src={model.icon} alt={model.displayName} className="w-5 h-5" />
                            )}
                            <span>{model.displayName}</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Invocation Phrases */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Invocation Phrases</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={8}>
                      Phrases that activate this cast member when used in messages.
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className="flex gap-2 mb-2">
                  <Input value={newInvocationPhrase} onChange={(e) => setNewInvocationPhrase(e.target.value)} placeholder="e.g., Hey Dax, Ask Dax" className="flex-1 glass-search"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                        e.preventDefault();
                        handleAddInvocationPhrase();
                      }
                    }}
                  />
                  <Button className="bg-gradient-to-r from-indigo-500/80 to-purple-500/80 
    text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(255,255,255,0.3),0_2px_6px_rgba(0,0,0,0.4)]
   hover:shadow-[0_0_12px_rgba(131,113,243,0.8),inset_1px_1px_6px_rgba(255,255,255,0.6)]
    border-[1px] border-white/50
    backdrop-blur-3xl
    transition duration-300 ease-out max-sm:text-sm" type="button" onClick={handleAddInvocationPhrase}>Add Phrase</Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(formDataState.invocationPhrases || []).map((phrase, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center">
                      {phrase}
                      <Button variant="ghost" size="icon" className="ml-2 h-4 w-4" onClick={() => handleRemoveInvocationPhrase(phrase)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div
              className="
    flex flex-col sm:flex-row 
    justify-end items-stretch sm:items-center 
    gap-3 sm:space-x-3 sm:gap-0
    w-full mt-6
  "
            >
              {/* 🔹 Cancel Button */}
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard/cast-members')}
                disabled={updateCastMemberMutation.isPending}
                className="
      w-full sm:w-auto 
      text-sm sm:text-base 
      py-2 sm:py-2.5
      transition duration-200
    "
              >
                Cancel
              </Button>

              {/* 🔹 Save Button */}
              <Button
                type="submit"
                disabled={updateCastMemberMutation.isPending || isLoadingCastMember}
                className="
      w-full sm:w-auto 
      bg-gradient-to-r from-indigo-500/80 to-purple-500/80 
      text-white font-medium 
      shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(255,255,255,0.3),0_2px_6px_rgba(0,0,0,0.4)]
      hover:shadow-[0_0_12px_rgba(131,113,243,0.8),inset_1px_1px_6px_rgba(255,255,255,0.6)]
      border border-white/50
      backdrop-blur-3xl
      transition duration-300 ease-out
      text-sm sm:text-base 
      py-2 sm:py-2.5
    "
              >
                {updateCastMemberMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Save Changes
              </Button>
            </div>

          </form>
        </TooltipProvider>
      </div>
    </DashboardLayout>
  );
};

export default EditCastMember;
