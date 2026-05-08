import { useApiQuery, useApiMutation, useApiDelete } from "./use-api";
import { CastMemberType } from "@/components/deviation/CastMemberCard";
import {
  castMemberService,
  CreateCastMemberPayload,
  UpdateCastMemberPayload,
} from "@/services/castMemberService";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export const castMemberKeys = {
  all: ["castMembers"] as const,
  lists: () => [...castMemberKeys.all, "list"] as const,
  detail: (id: string) => [...castMemberKeys.all, "detail", id] as const,
};

export const useCastMembers = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const useCastMembersQuery = () => {
    return useApiQuery<CastMemberType[]>(castMemberKeys.lists(), "/cast");
  };

  const useCastMemberQuery = (id?: string) => {
    return useApiQuery<CastMemberType>(
      castMemberKeys.detail(id || "new"),
      `/cast/${id}`,
      {
        enabled: !!id,
      }
    );
  };

  const useCreateCastMember = () => {
    return useApiMutation<CastMemberType, CreateCastMemberPayload>("/cast", {
      mutationFn: castMemberService.createCastMember,
      onSuccess: (newCastMember) => {
        queryClient.invalidateQueries({ queryKey: castMemberKeys.lists() });
        toast({
          title: "Cast Member Created",
          description: `"${newCastMember.name}" has been successfully created. \n Deduction: ${newCastMember.deductedDucks} Ducks.`,
        });
      },
      onError: (error) => {
        // toast({
        //   title: "Creation Failed",
        //   description: error.message || "Could not create cast member.",
        //   variant: "destructive"
        // });
      },
    });
  };

  // Mutation hook for updating a cast member
  const useUpdateCastMember = () => {
    return useApiMutation<CastMemberType, UpdateCastMemberPayload>(
      "/cast", // Base URL, ID will be part of the URL in service method
      {
        mutationFn: castMemberService.updateCastMember, // Use the service method
        onSuccess: (updatedCastMember) => {
          queryClient.invalidateQueries({ queryKey: castMemberKeys.lists() });
          queryClient.invalidateQueries({
            queryKey: castMemberKeys.detail(updatedCastMember.id),
          });
          toast({
            title: "Cast Member Updated",
            description: `"${updatedCastMember.name}" has been successfully updated.`,
          });
        },
        onError: (error) => {
          toast({
            title: "Update Failed",
            description: error.message || "Could not update cast member.",
            variant: "destructive",
          });
        },
      }
    );
  };

  // Mutation hook for deleting a cast member
  const useDeleteCastMember = () => {
    return useApiDelete<void>(
      "/cast", // Base URL for DELETE, ID is appended by useApiDelete
      {
        mutationFn: castMemberService.deleteCastMember,
        onSuccess: (_, deletedId) => {
          queryClient.invalidateQueries({ queryKey: castMemberKeys.lists() });
          queryClient.removeQueries({
            queryKey: castMemberKeys.detail(String(deletedId)),
          }); // Ensure ID is string for key
          toast({
            title: "Cast Member Deleted",
            // Consider fetching the name before deleting if you want to include it in the toast
            description: "The cast member has been successfully deleted.",
          });
        },
        onError: (error) => {
          toast({
            title: "Deletion Failed",
            description: error.message || "Could not delete cast member.",
            variant: "destructive",
          });
        },
      }
    );
  };

  // Direct service access for more complex operations is already available via castMemberService export
  return {
    useCastMembersQuery,
    useCastMemberQuery,
    useCreateCastMember,
    useUpdateCastMember,
    useDeleteCastMember,
    service: castMemberService, // Expose the service itself if needed
  };
};
