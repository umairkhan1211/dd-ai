import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Zap, Settings, Layers, Play, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProtocolType } from "@/services/protocolService";

interface ProtocolExecutorProps {
  protocol: ProtocolType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExecute: (prompt: string, metadata?: Record<string, unknown>) => void;
}

interface InputValues {
  [key: string]: string | number | boolean;
}

interface ModifierValues {
  [key: string]: string | number | boolean;
}

interface ProtocolExecutionData {
  protocolId: string;
  inputs: InputValues;
  modifiers: ModifierValues;
  metadata: {
    protocolName: string;
    level: number;
    type: string;
    logic?: ProtocolType["logic"];
    iteration?: number;
    maxIterations?: number;
    showProgress?: boolean;
    chainStep?: number;
    totalSteps?: number;
    stepName?: string;
    currentStepTemplate?: string;
  };
}

export function ProtocolExecutor({
  protocol,
  open,
  onOpenChange,
  onExecute,
}: ProtocolExecutorProps) {
  const [inputValues, setInputValues] = useState<InputValues>({});
  const [modifierValues, setModifierValues] = useState<ModifierValues>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setInputValues({});
    setModifierValues({});
    setIsExecuting(false);
  };

  const handleInputChange = (
    inputName: string,
    value: string | number | boolean
  ) => {
    setInputValues((prev) => ({ ...prev, [inputName]: value }));
  };

  const handleModifierChange = (
    modifierName: string,
    value: string | number | boolean
  ) => {
    setModifierValues((prev) => ({ ...prev, [modifierName]: value }));
  };

  const validateInputs = (): boolean => {
    if (!protocol.inputs) return true;

    for (const input of protocol.inputs) {
      if (
        input.required &&
        (!inputValues[input.name] || inputValues[input.name] === "")
      ) {
        toast({
          title: "Validation Error",
          description: `${input.label} is required.`,
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  const interpolateTemplate = (
    template: string,
    inputs: InputValues,
    modifiers: ModifierValues
  ): string => {
    let result = template;

    // Replace input placeholders
    Object.entries(inputs).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      result = result.replace(new RegExp(placeholder, "g"), String(value));
    });

    // Replace modifier placeholders
    Object.entries(modifiers).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      result = result.replace(new RegExp(placeholder, "g"), String(value));
    });

    return result;
  };

  const executeLevel1Protocol = async () => {
    // Level 1: Static trigger - send protocol ID/name only
    onExecute(protocol.id, {
      protocolId: protocol.id,
      protocolName: protocol.name,
      level: 1,
      type: "static",
    });
  };

  const executeLevel2Protocol = async () => {
    // Level 2: Semi-dynamic - send protocol execution data as JSON
    const executionData = {
      protocolId: protocol.id,
      inputs: inputValues,
      modifiers: modifierValues,
      metadata: {
        protocolName: protocol.name,
        level: 2,
        type: "semi-dynamic",
      },
    };

    onExecute(JSON.stringify(executionData), {
      protocolId: protocol.id,
      protocolName: protocol.name,
      level: 2,
      type: "semi-dynamic",
      inputs: inputValues,
      modifiers: modifierValues,
    });
  };

  const executeLevel3Protocol = async () => {
    // Level 3: Compositional - handle complex logic, iterations, and chaining
    setIsExecuting(true);

    try {
      const executionData = {
        protocolId: protocol.id,
        inputs: inputValues,
        modifiers: modifierValues,
        metadata: {
          protocolName: protocol.name,
          level: 3,
          type: "compositional",
          logic: protocol.logic,
        },
      };

      // For Level 3, always send a single execution request
      // The backend will handle iterations and chaining logic
      onExecute(JSON.stringify(executionData), {
        protocolId: protocol.id,
        protocolName: protocol.name,
        level: 3,
        type: "compositional",
        inputs: inputValues,
        modifiers: modifierValues,
        logic: protocol.logic,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleExecute = async () => {
    if (protocol.level >= 2 && !validateInputs()) {
      return;
    }

    try {
      switch (protocol.level) {
        case 1:
          await executeLevel1Protocol();
          break;
        case 2:
          await executeLevel2Protocol();
          break;
        case 3:
          await executeLevel3Protocol();
          break;
      }

      // Close modal after execution for all levels
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Execution Error",
        description:
          error instanceof Error ? error.message : "Failed to execute protocol",
        variant: "destructive",
      });
    }
  };

  const renderInputField = (input: NonNullable<ProtocolType["inputs"]>[0]) => {
    const value = inputValues[input.name] || input.defaultValue || "";

    switch (input.type) {
      case "text":
        return (
          <Textarea
            value={String(value)}
            onChange={(e) => handleInputChange(input.name, e.target.value)}
            placeholder={input.placeholder}
            rows={3}
            maxLength={1000}
          />
        );
      case "number":
        return (
          <Input
            type="number"
            value={Number(value)}
            onChange={(e) =>
              handleInputChange(input.name, parseFloat(e.target.value) || 0)
            }
            placeholder={input.placeholder}
          />
        );
      case "boolean":
        return (
          <Switch
            checked={Boolean(value)}
            onCheckedChange={(checked) =>
              handleInputChange(input.name, checked)
            }
          />
        );
      case "select":
        return (
          <Select
            value={String(value)}
            onValueChange={(val) => handleInputChange(input.name, val)}
          >
            <SelectTrigger>
              <SelectValue placeholder={input.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {input.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return (
          <Input
            value={String(value)}
            onChange={(e) => handleInputChange(input.name, e.target.value)}
            placeholder={input.placeholder}
          />
        );
    }
  };

  const renderModifierField = (
    modifier: NonNullable<ProtocolType["modifiers"]>[0]
  ) => {
    const value = modifierValues[modifier.name] || modifier.defaultValue || "";

    switch (modifier.type) {
      case "select":
        return (
          <Select
            value={String(value)}
            onValueChange={(val) => handleModifierChange(modifier.name, val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              {modifier.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "toggle":
        return (
          <Switch
            checked={Boolean(value)}
            onCheckedChange={(checked) =>
              handleModifierChange(modifier.name, checked)
            }
          />
        );
      case "slider":
        return (
          <div className="space-y-2">
            <Slider
              value={[Number(value) || modifier.min || 0]}
              onValueChange={(values) =>
                handleModifierChange(modifier.name, values[0])
              }
              min={modifier.min || 0}
              max={modifier.max || 10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{modifier.min || 0}</span>
              <span>{Number(value) || modifier.min || 0}</span>
              <span>{modifier.max || 10}</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getLevelIcon = (level: number) => {
    switch (level) {
      case 1:
        return <Zap className="h-4 w-4" />;
      case 2:
        return <Settings className="h-4 w-4" />;
      case 3:
        return <Layers className="h-4 w-4" />;
      default:
        return <Play className="h-4 w-4" />;
    }
  };

  const getLevelName = (level: number) => {
    switch (level) {
      case 1:
        return "Static Trigger";
      case 2:
        return "Semi-Dynamic Injection";
      case 3:
        return "Compositional Protocol Logic";
      default:
        return "Unknown";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getLevelIcon(protocol.level)}
            Execute: {protocol.name}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-150px)] pr-4">
          <div className="space-y-6">
            {/* Protocol Info */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{protocol.name}</CardTitle>
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getLevelIcon(protocol.level)}
                    Level {protocol.level}
                  </Badge>
                </div>
                <CardDescription>{protocol.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Type: {getLevelName(protocol.level)}</span>
                  {protocol.category && (
                    <span>Category: {protocol.category}</span>
                  )}
                  {protocol.deliveredBy && (
                    <span>Delivered by: {protocol.deliveredBy}</span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Level 1: No inputs needed */}
            {protocol.level === 1 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      This is a static protocol. Click execute to send the
                      predefined prompt.
                    </p>
                    <div className="p-3 bg-muted rounded-lg text-left">
                      <p className="text-sm font-mono">
                        {protocol.promptTemplate}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Level 2 & 3: Input Fields */}
            {protocol.level >= 2 &&
              protocol.inputs &&
              protocol.inputs.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Input Fields</CardTitle>
                    <CardDescription>
                      Fill in the required information for this protocol
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {protocol.inputs.map((input) => (
                      <div key={input.name}>
                        <Label
                          htmlFor={input.name}
                          className="flex items-center gap-2 pb-2"
                        >
                          {input.label}
                          {input.required && (
                            <span className="text-destructive">*</span>
                          )}
                        </Label>
                        {renderInputField(input)}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

            {/* Level 2 & 3: Modifiers */}
            {protocol.level >= 2 &&
              protocol.modifiers &&
              protocol.modifiers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Modifiers</CardTitle>
                    <CardDescription>
                      Optional settings to customize the protocol behavior
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {protocol.modifiers.map((modifier) => (
                      <div key={modifier.name}>
                        <Label htmlFor={modifier.name}>{modifier.label}</Label>
                        {renderModifierField(modifier)}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

            {/* Level 3: Logic Information */}
            {protocol.level === 3 && protocol.logic && (
              <Card>
                <CardHeader>
                  <CardTitle>Protocol Logic</CardTitle>
                  <CardDescription>
                    This protocol includes advanced compositional logic
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {protocol.logic.iterations?.enabled && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Iterative</Badge>
                        <span>
                          Max iterations:{" "}
                          {protocol.logic.iterations.maxIterations || 3}
                        </span>
                      </div>
                    )}
                    {protocol.logic.chaining?.enabled && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Chained</Badge>
                        <span>
                          Steps: {protocol.logic.chaining.steps?.length || 0}
                        </span>
                      </div>
                    )}
                    {protocol.logic.conditions &&
                      protocol.logic.conditions.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Conditional</Badge>
                          <span>Rules: {protocol.logic.conditions.length}</span>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleExecute}
            disabled={isExecuting}
            className="flex items-center gap-2"
          >
            {isExecuting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Execute Protocol
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
