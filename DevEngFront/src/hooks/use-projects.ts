import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  projectService,
  CreateProjectPayload,
  UpdateProjectPayload,
} from "@/services/projectService";
import { ProjectType } from "@/components/projects/ProjectCard";
import { useToast } from "@/hooks/use-toast";

// Query keys
export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (filters: string) => [...projectKeys.lists(), { filters }] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

export const useProjects = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get all projects
  const useProjectsQuery = () => {
    return useQuery({
      queryKey: projectKeys.lists(),
      queryFn: projectService.getProjects,
    });
  };

  // Get a single project
  const useProjectQuery = (id?: string) => {
    return useQuery({
      queryKey: projectKeys.detail(id || "new"),
      queryFn: () =>
        id ? projectService.getProject(id) : Promise.resolve(undefined),
      enabled: !!id,
    });
  };

  // Create a new project
  const useCreateProject = () => {
    return useMutation({
      mutationFn: projectService.createProject,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
        toast({
          title: "Project created",
          description: `"${data.title}" has been created successfully.`,
        });
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create project. Please try again.",
        });
      },
    });
  };

  // Update a project
  const useUpdateProject = () => {
    return useMutation({
      mutationFn: projectService.updateProject,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: projectKeys.detail(data.id),
        });
        queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
        toast({
          title: "Project updated",
          description: `"${data.title}" has been updated successfully.`,
        });
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update project. Please try again.",
        });
      },
    });
  };

  // Delete a project
  const useDeleteProject = () => {
    return useMutation({
      mutationFn: projectService.deleteProject,
      onSuccess: (_, id) => {
        queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
        queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) });
        queryClient.removeQueries({ queryKey: projectKeys.detail(id) });
        toast({
          title: "Project deleted",
          description: "Project has been deleted successfully.",
        });
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete project. Please try again.",
        });
      },
    });
  };

  return {
    useProjectsQuery,
    useProjectQuery,
    useCreateProject,
    useUpdateProject,
    useDeleteProject,
  };
};
