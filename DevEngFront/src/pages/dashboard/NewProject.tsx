// NewProject.tsx

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProjectForm } from "@/components/projects/ProjectForm";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useProjects } from "@/hooks/use-projects";

import { useEffect, useRef, useState } from "react";

const NewProject = () => {
  const navigate = useNavigate();
  const { useCreateProject } = useProjects();
  const { mutate: createProject, isPending } = useCreateProject();







  const handleCreateProject = (formData: FormData) => {
    createProject(formData, {
      onSuccess: (data) => {
        navigate(`/dashboard/projects/${data.id}`);
      },
    });
  };


  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto p-6 ">
        {/* Heading ko style karein */}
        <h1 className="mb-6 gradient-text text-center">
          Create New Project
        </h1>

        {/* Card par glass class apply karein */}
        <Card className="glass-tabs">
          <CardHeader>
            <CardTitle className="text-card-foreground">Project Details</CardTitle>
            <CardDescription className="text-muted-foreground">
              Create a new project workspace to organize your AI agents and
              conversations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectForm
              onSubmit={handleCreateProject}
              isSubmitting={isPending}
            />
          </CardContent>
        </Card>
      </div>

    </DashboardLayout>
  );
};

export default NewProject;