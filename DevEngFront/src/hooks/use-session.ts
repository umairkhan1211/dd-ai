import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionService, SessionMeta } from "../services/sessionService";
import { useToast } from "./use-toast"; // Assuming you have a toast hook

export const sessionKeys = {
  all: ["sessions"] as const,
  detail: (id: string) => [...sessionKeys.all, "detail", id] as const,
};

/**
 * Hook to fetch a single session's details.
 */
export const useSessionQuery = (sessionId: string) => {
  return useQuery({
    queryKey: sessionKeys.detail(sessionId),
    queryFn: () => sessionService.getSession(sessionId),
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to update a session's metadata.
 */
export const useUpdateSessionMeta = (sessionId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (newMeta: Partial<SessionMeta>) =>
      sessionService.updateSessionMeta(sessionId, newMeta),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sessionKeys.detail(sessionId),
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Failed to update session",
        description:
          "There was an error updating the session. Please try again.",
      });
    },
  });
};

interface ForkSessionVariables {
  originalSessionId: string;
  title?: string;
  copyDepth?: number;
}

/**
 * Hook to fork a session.
 */
export const useForkSession = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      originalSessionId,
      title,
      copyDepth,
    }: {
      originalSessionId: string;
      title?: string;
      copyDepth?: number;
    }) => sessionService.forkSession(originalSessionId, title, copyDepth),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.all });
      toast({
        title: "Session forked",
        description: "New task created successfully.",
      });
      return data;
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Failed to fork session",
        description:
          "There was an error forking the session. Please try again.",
      });
    },
  });
};

// Hook to delete a session
export const useDeleteSession = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (sessionId: string) => sessionService.deleteSession(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.all });
      toast({
        title: "Task deleted",
        description: "Task deleted successfully.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Failed to delete task",
        description: "There was an error deleting the task. Please try again.",
      });
    },
  });
};
