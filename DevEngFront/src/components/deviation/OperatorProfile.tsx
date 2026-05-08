import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Plus, X, Trash2, Edit3, CheckCircle } from "lucide-react";
import { useOperators } from "@/hooks/use-operators";
import {
  OperatorType,
  OperatorProfileData,
  CreateOperatorPayload,
  UpdateOperatorPayload,
} from "@/services/operatorService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UserType } from "@/types/user";
import apiClient from "@/lib/api";

// User Profile Hook Definition (should ideally be in its own file e.g., hooks/use-user-profile.ts)
const fetchUserProfile = async (): Promise<UserType> => {
  // This should ideally hit an endpoint that returns UserType including activeOperator and activeOperatorDetail
  // For now, using /user/me which might need adjustment in the backend to include activeOperator details.
  const response = await apiClient.get<UserType>("/user/me");
  return response.data;
};

const useUserProfile = () => {
  return useQuery<UserType, Error>({
    queryKey: ["user", "profile"],
    queryFn: fetchUserProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Retry once on failure
  });
};
// End of User Profile Hook Definition

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const DEFAULT_PROFILE_DATA: OperatorProfileData = {
  name: "New Operator Persona",
  traits: "focused, analytical, creative",
  languagePreferences: "direct, concise",
  failureStates: ["distracted by new ideas"],
  successTriggers: ["clear outcomes and deadlines"],
  rules: ["always verify assumptions", "prioritize highest leverage tasks"],
  settings: {
    recursiveProcessing: true,
  },
};

export function OperatorProfile() {
  {
    /*
  const {
    useOperatorsQuery,
    useCreateOperator,
    useUpdateOperator,
    useDeleteOperator,
    useSetActiveOperator,
  } = useOperators();
  const {
    data: operators,
    isLoading: isLoadingOperators,
    refetch: refetchOperators,
  } = useOperatorsQuery();
  const createOperatorMutation = useCreateOperator();
  const updateOperatorMutation = useUpdateOperator();
  const deleteOperatorMutation = useDeleteOperator();
  const setActiveOperatorMutation = useSetActiveOperator();

  const {
    data: currentUser,
    isLoading: isLoadingUser,
    refetch: refetchUser,
  } = useUserProfile();
  const queryClient = useQueryClient();

  const [selectedOperatorId, setSelectedOperatorId] = useState<string | null>(
    null
  );
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [currentLabel, setCurrentLabel] = useState("New Profile Label");

  const [profileData, setProfileData] =
    useState<OperatorProfileData>(DEFAULT_PROFILE_DATA);

  const [newFailureState, setNewFailureState] = useState("");
  const [newSuccessTrigger, setNewSuccessTrigger] = useState("");
  const [newRule, setNewRule] = useState("");

  const creatingNewProfileIntentRef = useRef(false);
  const labelInputRef = useRef<HTMLInputElement>(null);
  const userHasInteractedWithSelectionRef = useRef(false);

  useEffect(() => {
    if (creatingNewProfileIntentRef.current) return;
    if (
      userHasInteractedWithSelectionRef.current &&
      selectedOperatorId !== currentUser?.activeOperator
    ) {
      return;
    }

    if (currentUser?.activeOperator && operators) {
      const activeOpExists = operators.find(
        (op) => op.id === currentUser.activeOperator
      );
      if (activeOpExists && selectedOperatorId !== currentUser.activeOperator) {
        setSelectedOperatorId(currentUser.activeOperator);
        userHasInteractedWithSelectionRef.current = false;
      }
    }
  }, [currentUser?.activeOperator, operators]);

  useEffect(() => {
    if (creatingNewProfileIntentRef.current) return;

    if (
      !selectedOperatorId &&
      operators &&
      operators.length > 0 &&
      !operators.find((op) => op.id === currentUser?.activeOperator)
    ) {
      if (
        !userHasInteractedWithSelectionRef.current ||
        operators.every((op) => op.id !== selectedOperatorId)
      ) {
        setSelectedOperatorId(operators[0].id);
        userHasInteractedWithSelectionRef.current = false;
      }
    } else if (
      selectedOperatorId &&
      operators &&
      !operators.find((op) => op.id === selectedOperatorId)
    ) {
      if (
        currentUser?.activeOperator &&
        operators.find((op) => op.id === currentUser.activeOperator)
      ) {
        setSelectedOperatorId(currentUser.activeOperator);
      } else if (operators.length > 0) {
        setSelectedOperatorId(operators[0].id);
      } else {
        setSelectedOperatorId(null);
      }
      userHasInteractedWithSelectionRef.current = false;
    } else if (
      (!operators || operators.length === 0) &&
      selectedOperatorId !== null
    ) {
      setSelectedOperatorId(null);
      userHasInteractedWithSelectionRef.current = false;
    }
  }, [operators, selectedOperatorId, currentUser?.activeOperator]);

  useEffect(() => {
    if (selectedOperatorId && operators) {
      const selectedOp = operators.find((op) => op.id === selectedOperatorId);
      if (selectedOp) {
        setProfileData(selectedOp.profile);
        setCurrentLabel(selectedOp.label);
        setIsEditingLabel(false);
        if (creatingNewProfileIntentRef.current) {
          creatingNewProfileIntentRef.current = false;
        }
      }
    } else if (!selectedOperatorId) {
      setProfileData(DEFAULT_PROFILE_DATA);
      setCurrentLabel("New Profile Label");
      setIsEditingLabel(true);
      setTimeout(() => labelInputRef.current?.focus(), 0);
      if (creatingNewProfileIntentRef.current) {
        creatingNewProfileIntentRef.current = false;
      }
    }
  }, [selectedOperatorId, operators]);

  const handleProfileDataChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSettingChange = (
    settingKey: keyof OperatorProfileData["settings"]
  ) => {
    setProfileData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [settingKey]: !prev.settings[settingKey],
      },
    }));
  };

  const addListItem = (
    itemType: "failureStates" | "successTriggers" | "rules"
  ) => {
    let valueToAdd = "";
    let fieldState: string;
    let fieldSetter: React.Dispatch<React.SetStateAction<string>>;

    if (itemType === "failureStates") {
      fieldState = newFailureState;
      fieldSetter = setNewFailureState;
    } else if (itemType === "successTriggers") {
      fieldState = newSuccessTrigger;
      fieldSetter = setNewSuccessTrigger;
    } else {
      fieldState = newRule;
      fieldSetter = setNewRule;
    }
    valueToAdd = fieldState.trim();

    if (valueToAdd) {
      setProfileData((prev) => ({
        ...prev,
        [itemType]: [...prev[itemType], valueToAdd],
      }));
      fieldSetter("");
    }
  };

  const removeListItem = (
    itemType: "failureStates" | "successTriggers" | "rules",
    index: number
  ) => {
    setProfileData((prev) => ({
      ...prev,
      [itemType]: prev[itemType].filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    if (!currentLabel.trim()) {
      toast.error("Profile Label Required", {
        description: "Please provide a name for this operator profile.",
      });
      labelInputRef.current?.focus();
      return;
    }

    const operatorPayload = {
      label: currentLabel.trim(),
      profile: profileData,
    };

    const existingOperator = selectedOperatorId
      ? operators?.find((op) => op.id === selectedOperatorId)
      : null;

    if (existingOperator) {
      updateOperatorMutation.mutate(
        { id: selectedOperatorId!, ...operatorPayload },
        {
          onSuccess: (updatedOperator) => {
            toast.success("Operator profile updated", {
              description: `"${updatedOperator.label}" has been saved successfully.`,
            });
            setIsEditingLabel(false);
            userHasInteractedWithSelectionRef.current = false;
          },
          onError: (error) => {
            toast.error("Update failed", {
              description: error.message || "Could not update profile.",
            });
          },
        }
      );
    } else {
      createOperatorMutation.mutate(operatorPayload as CreateOperatorPayload, {
        onSuccess: (newOperator) => {
          toast.success("Operator profile created", {
            description: `"${newOperator.label}" has been created successfully.`,
          });
          refetchOperators().then(() => {
            setSelectedOperatorId(newOperator.id);
            userHasInteractedWithSelectionRef.current = false;
          });
          setIsEditingLabel(false);
        },
        onError: (error) => {
          // toast.error("Creation failed", {
          //   description: error.message || "Could not create profile.",
          // });
        },
      });
    }
  };

  const handleSelectOperator = (id: string) => {
    userHasInteractedWithSelectionRef.current = true;
    if (id === "new") {
      creatingNewProfileIntentRef.current = true;
      setSelectedOperatorId(null);
    } else {
      creatingNewProfileIntentRef.current = false;
      setSelectedOperatorId(id);
    }
  };

  const handleAddNewProfileIntent = () => {
    userHasInteractedWithSelectionRef.current = true;
    creatingNewProfileIntentRef.current = true;
    setSelectedOperatorId(null);
  };

  const handleDeleteOperator = () => {
    if (selectedOperatorId) {
      const labelOfDeleted =
        operators?.find((op) => op.id === selectedOperatorId)?.label ||
        "Profile";
      deleteOperatorMutation.mutate(selectedOperatorId, {
        onSuccess: () => {
          toast.success(`"${labelOfDeleted}" Deleted`);
          userHasInteractedWithSelectionRef.current = false;
        },
        onError: (error) => {
          toast.error("Delete failed", {
            description: error.message || "Could not delete profile.",
          });
        },
      });
    }
  };

  const handleSetActive = () => {
    if (selectedOperatorId) {
      setActiveOperatorMutation.mutate(selectedOperatorId, {
        onSuccess: (updatedUser) => {
          toast.success("Active Operator Set", {
            description: `"${
              updatedUser.activeOperatorDetail?.label || currentLabel
            }" is now active.`,
          });
          refetchUser();
          userHasInteractedWithSelectionRef.current = false;
        },
        onError: (error) => {
          toast.error("Failed to Set Active", {
            description: error.message || "Could not set active operator.",
          });
        },
      });
    }
  };

  const currentFullOperator = selectedOperatorId
    ? operators?.find((op) => op.id === selectedOperatorId)
    : null;
  const isActiveOperator =
    currentUser?.activeOperator === selectedOperatorId && !!selectedOperatorId;

  if (isLoadingOperators || isLoadingUser) {
    return <div className="p-6 text-center">Loading operator profiles...</div>;
  }

  const isSaveDisabled =
    createOperatorMutation.isPending ||
    updateOperatorMutation.isPending ||
    !currentLabel.trim();

  return (
    <div className="h-full overflow-y-auto space-y-6 p-1">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sticky top-0 bg-card p-4 z-10 border-b">
        <div className="flex-grow flex items-center gap-2">
          <Label
            htmlFor="operatorSelector"
            className="text-sm font-medium shrink-0"
          >
            Operator Profile
          </Label>
          <div className="flex items-center gap-2 mt-0 sm:mt-0 flex-grow min-w-0">
            <Select
              value={selectedOperatorId || "new"}
              onValueChange={handleSelectOperator}
              disabled={isLoadingOperators || isLoadingUser}
            >
              <SelectTrigger
                className="rounded-xl flex-1 min-w-[180px]"
                id="operatorSelector"
              >
                <SelectValue
                  placeholder={
                    isLoadingOperators || isLoadingUser
                      ? "Loading..."
                      : "Select or Create Profile"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">
                  <span className="flex items-center">
                    <Plus className="h-4 w-4 mr-2" /> Create New Profile
                  </span>
                </SelectItem>
                {operators &&
                  operators.map((op) => (
                    <SelectItem key={op.id} value={op.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{op.label}</span>
                        {currentUser?.activeOperator === op.id && (
                          <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {operators && operators.length > 0 && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleAddNewProfileIntent}
                className="rounded-xl shrink-0"
                aria-label="Create new profile"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2 sm:mt-0 self-start sm:self-center">
          {selectedOperatorId && currentFullOperator && !isActiveOperator && (
            <Button
              onClick={handleSetActive}
              variant="outline"
              className="rounded-xl"
              disabled={
                setActiveOperatorMutation.isPending || !selectedOperatorId
              }
            >
              {setActiveOperatorMutation.isPending
                ? "Setting..."
                : "Set Active"}
            </Button>
          )}
          <Button
            onClick={handleSave}
            className="rounded-xl"
            disabled={isSaveDisabled}
          >
            {createOperatorMutation.isPending ||
            updateOperatorMutation.isPending
              ? "Saving..."
              : currentFullOperator
              ? "Save Changes"
              : "Create Profile"}
          </Button>
          {selectedOperatorId && currentFullOperator && (
            <Button
              variant="destructive"
              size="icon"
              onClick={handleDeleteOperator}
              className="rounded-xl"
              disabled={deleteOperatorMutation.isPending || !selectedOperatorId}
              aria-label="Delete selected profile"
            >
              {deleteOperatorMutation.isPending ? (
                <span className="animate-spin h-4 w-4 border-2 border-background border-t-destructive rounded-full" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      <motion.div
        key={selectedOperatorId || "new"}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 px-4 pb-4"
      >
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="operatorLabel">
                  Profile Label <span className="text-red-500">*</span>
                </Label>
                {isEditingLabel || !currentFullOperator ? (
                  <div className="flex items-center gap-2">
                    <Input
                      id="operatorLabel"
                      ref={labelInputRef}
                      name="operatorLabel"
                      value={currentLabel}
                      onChange={(e) => setCurrentLabel(e.target.value)}
                      placeholder="Name this operator profile"
                      className="rounded-xl flex-1"
                      required
                      aria-required="true"
                    />
                    {currentFullOperator && isEditingLabel && (
                      <Button
                        size="icon"
                        onClick={() => {
                          setIsEditingLabel(false);
                          if (!currentLabel.trim() && currentFullOperator)
                            setCurrentLabel(currentFullOperator.label);
                        }}
                        className="rounded-xl"
                        aria-label="Confirm label"
                        type="button"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium py-2">
                      {currentLabel}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setIsEditingLabel(true);
                        setTimeout(() => labelInputRef.current?.focus(), 0);
                      }}
                      aria-label="Edit label"
                      type="button"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Internal Name/Persona</Label>
                <Input
                  id="name"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileDataChange}
                  className="rounded-xl"
                  placeholder="e.g., Operator, Assistant, CodeHelper V2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="traits">Cognitive Traits</Label>
                <Textarea
                  id="traits"
                  name="traits"
                  value={profileData.traits}
                  onChange={handleProfileDataChange}
                  placeholder="e.g., ADHD, analytical, visual thinker, prefers structured data"
                  className="rounded-xl resize-none"
                  rows={2}
                  maxLength={1000}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="languagePreferences">
                  Language Preferences
                </Label>
                <Textarea
                  id="languagePreferences"
                  name="languagePreferences"
                  value={profileData.languagePreferences}
                  onChange={handleProfileDataChange}
                  placeholder="e.g., direct, concise, avoid metaphors, use bullet points for lists"
                  className="rounded-xl resize-none"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newFailureState">Common Failure States</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {profileData.failureStates.map((state, index) => (
                    <div
                      key={`failure-${index}-${state}`}
                      className="bg-secondary/40 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      <span>{state}</span>
                      <button
                        onClick={() => removeListItem("failureStates", index)}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label={`Remove failure state: ${state}`}
                        type="button"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    id="newFailureState"
                    value={newFailureState}
                    onChange={(e) => setNewFailureState(e.target.value)}
                    placeholder="Add a new failure state"
                    className="rounded-xl flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addListItem("failureStates");
                      }
                    }}
                  />
                  <Button
                    onClick={() => addListItem("failureStates")}
                    size="sm"
                    className="rounded-xl"
                    type="button"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Add failure state</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newSuccessTrigger">Success Triggers</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {profileData.successTriggers.map((trigger, index) => (
                    <div
                      key={`success-${index}-${trigger}`}
                      className="bg-secondary/40 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      <span>{trigger}</span>
                      <button
                        onClick={() => removeListItem("successTriggers", index)}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label={`Remove success trigger: ${trigger}`}
                        type="button"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    id="newSuccessTrigger"
                    value={newSuccessTrigger}
                    onChange={(e) => setNewSuccessTrigger(e.target.value)}
                    placeholder="Add a new success trigger"
                    className="rounded-xl flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addListItem("successTriggers");
                      }
                    }}
                  />
                  <Button
                    onClick={() => addListItem("successTriggers")}
                    size="sm"
                    className="rounded-xl"
                    type="button"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Add success trigger</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newRule">Rules</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {profileData.rules.map((rule, index) => (
                    <div
                      key={`rule-${index}-${rule}`}
                      className="bg-secondary/40 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      <span>{rule}</span>
                      <button
                        onClick={() => removeListItem("rules", index)}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label={`Remove rule: ${rule}`}
                        type="button"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    id="newRule"
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    placeholder="Add a new rule"
                    className="rounded-xl flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addListItem("rules");
                      }
                    }}
                  />
                  <Button
                    onClick={() => addListItem("rules")}
                    size="sm"
                    className="rounded-xl"
                    type="button"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Add rule</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6 space-y-3">
              <h3 className="text-lg font-medium">System Settings</h3>

              <div className="flex justify-between items-center">
                <div>
                  <Label
                    htmlFor="recursiveProcessingToggle"
                    className="font-medium"
                    id="recursiveProcessingLabel"
                  >
                    Recursive Processing
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Allow multi-step refinement of outputs
                  </p>
                </div>
                <Switch
                  id="recursiveProcessingToggle"
                  checked={profileData.settings.recursiveProcessing}
                  onCheckedChange={() =>
                    handleProfileSettingChange("recursiveProcessing")
                  }
                  aria-labelledby="recursiveProcessingLabel"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
    
  );
  */
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-7 mt-16">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Operator Profile</CardTitle>
            <CardDescription>Manage your Operator Profile.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Operator Profile coming soon...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
}
