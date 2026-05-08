import { useState, ChangeEvent, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2, Upload, HelpCircle } from "lucide-react";

interface ProjectFormProps {
  initialProject?: { title: string; description: string };
  onSubmit: (formData: FormData) => void; // <-- yaha change
  isSubmitting?: boolean;
}

export function ProjectForm({
  initialProject,
  onSubmit,
  isSubmitting = false,
}: ProjectFormProps) {
  const [formValues, setFormValues] = useState({
    title: initialProject?.title || "",
    description: initialProject?.description || "",
  });

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // text field change
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  // image change
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

 const handleSubmit = (e: FormEvent) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("title", formValues.title);
formData.append(
  "meta",
  JSON.stringify({ description: formValues.description, agentCount: 0 })
);
  if (image) {
    formData.append("avatar", image); 
  }

  onSubmit(formData);
};


  // Paste handler for description
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Project Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-card-foreground/80">
          Project Title
        </Label>
        <Input
          id="title"
          name="title"
          value={formValues.title}
          onChange={handleChange}
          placeholder="Enter project title..."
          required
          className="glass-search"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-card-foreground/80">
          Description
        </Label>
        <Textarea
          id="description"
          name="description"
          value={formValues.description}
          onChange={handleChange}
          placeholder="Describe your project..."
          rows={4}
          required
          maxLength={1500}
          className="glass-search"
        />
      </div>

      {/* Image Upload Card */}
      <Card className="glass-search">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-card-foreground/80">Upload Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-card-foreground/80">
                Project Image 
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground/80 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={8}>
                  Upload a project thumbnail image (max size 4MB).
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Image Preview (Default or Selected) */}
            <div className="flex items-center justify-center">
              <div
                className="w-32 h-32 rounded-md  overflow-hidden shadow-md cursor-pointer hover:opacity-80 transition"
                onClick={() =>
                  document.getElementById("projectImageUpload")?.click()
                }
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Project Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-muted-foreground text-sm">
                    Click to Upload
                  </div>
                )}
              </div>
            </div>

            {/* Hidden File Input */}
            <input
              id="projectImageUpload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit button */}
      <div className="flex justify-end">
        <Button
          className="glass-project-button"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          {initialProject ? "Update Project" : "Create Project"}
        </Button>
      </div>
    </form>
  );
}
