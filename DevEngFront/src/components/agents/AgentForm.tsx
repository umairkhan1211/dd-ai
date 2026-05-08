import { useState, ChangeEvent, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { AgentType } from "./AgentCard";

interface AgentFormProps {
  initialAgent?: AgentType;
  onSubmit: (agent: Omit<AgentType, "id">) => void;
}

export function AgentForm({ initialAgent, onSubmit }: AgentFormProps) {
  const [formValues, setFormValues] = useState({
    name: initialAgent?.name || "",
    role: initialAgent?.role || "",
    description: initialAgent?.description || "",
    specialty: initialAgent?.specialty || [],
    newSpecialty: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSpecialty = () => {
    if (formValues.newSpecialty.trim() !== "") {
      setFormValues((prev) => ({
        ...prev,
        specialty: [...prev.specialty, prev.newSpecialty.trim()],
        newSpecialty: "",
      }));
    }
  };

  const handleRemoveSpecialty = (index: number) => {
    setFormValues((prev) => ({
      ...prev,
      specialty: prev.specialty.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const { newSpecialty, ...agentData } = formValues;
    onSubmit(agentData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Agent Name</Label>
        <Input
          id="name"
          name="name"
          value={formValues.name}
          onChange={handleChange}
          placeholder="e.g., Business Analyst"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Input
          id="role"
          name="role"
          value={formValues.role}
          onChange={handleChange}
          placeholder="e.g., Strategic Advisor"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formValues.description}
          onChange={handleChange}
          placeholder="Describe what this agent specializes in..."
          rows={4}
          required
          maxLength={1000}
        />
      </div>

      <div className="space-y-2">
        <Label>Specialties</Label>
        <div className="flex gap-2 mb-2">
          <Input
            name="newSpecialty"
            value={formValues.newSpecialty}
            onChange={handleChange}
            placeholder="Add a specialty..."
            className="flex-1"
          />
          <Button
            type="button"
            onClick={handleAddSpecialty}
            variant="secondary"
          >
            Add
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {formValues.specialty.map((spec, index) => (
            <div
              key={index}
              className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full flex items-center gap-1 text-sm"
            >
              {spec}
              <button
                type="button"
                onClick={() => handleRemoveSpecialty(index)}
                className="text-muted-foreground hover:text-foreground rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit">
          {initialAgent ? "Update Agent" : "Create Agent"}
        </Button>
      </div>
    </form>
  );
}
