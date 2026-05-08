import { useApiMutation, useApiUpdate, useApiDelete } from './use-api';
import {
  operatorService,
  OperatorType,
  CreateOperatorPayload,
  UpdateOperatorPayload,
} from '../services/operatorService'; // Relative path
import { UserType } from '../types/user'; // Relative path
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useToast } from './use-toast';

export const operatorKeys = {
  all: ['operators'] as const,
  lists: () => [...operatorKeys.all, 'list'] as const,
  details: () => [...operatorKeys.all, 'detail'] as const,
  detail: (id: string) => [...operatorKeys.details(), id] as const,
};

export const useOperators = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query hook for fetching all operators
  const useOperatorsQuery = () => {
    return useQuery<OperatorType[], Error>({
      queryKey: operatorKeys.lists(),
      queryFn: operatorService.getOperators,
    });
  };

  // Mutation hook for creating a new operator
  const useCreateOperator = () => {
    return useApiMutation<OperatorType, CreateOperatorPayload>(
      '/operators',
      {
        mutationFn: operatorService.createOperator,
        onSuccess: (newOperator) => {
          queryClient.invalidateQueries({ queryKey: operatorKeys.lists() });
          toast({
            title: "Operator Profile Created",
            description: `Profile "${newOperator.label}" has been created.`
          });
        },
        onError: (error) => {
          toast({
            title: "Error Creating Profile",
            description: error.message || "Could not create operator profile.",
            variant: "destructive",
          });
        }
      }
    );
  };

  // Mutation hook for updating an operator
  const useUpdateOperator = () => {
    return useApiUpdate<OperatorType, UpdateOperatorPayload>(
      '/operators', // Base URL, ID is part of payload for service
      {
        mutationFn: operatorService.updateOperator,
        onSuccess: (updatedOperator) => {
          queryClient.invalidateQueries({ queryKey: operatorKeys.lists() });
          queryClient.invalidateQueries({ queryKey: operatorKeys.detail(updatedOperator.id) });
          toast({
            title: "Operator Profile Updated",
            description: `Profile "${updatedOperator.label}" has been updated.`
          });
        },
        onError: (error) => {
          toast({
            title: "Error Updating Profile",
            description: error.message || "Could not update operator profile.",
            variant: "destructive",
          });
        }
      }
    );
  };

  // Mutation hook for deleting an operator
  const useDeleteOperator = () => {
    return useApiDelete<void>(
      '/operators', // Base URL, ID passed as second arg to mutationFn by useApiDelete
      {
        mutationFn: operatorService.deleteOperator, 
        onSuccess: (_, operatorId) => {
          // Ensure operatorId is treated as string for queryKey
          const idStr = String(operatorId);
          queryClient.invalidateQueries({ queryKey: operatorKeys.lists() });
          queryClient.removeQueries({ queryKey: operatorKeys.detail(idStr) });
          toast({
            title: "Operator Profile Deleted",
            description: "The operator profile has been deleted."
          });
        },
        onError: (error) => {
          toast({
            title: "Error Deleting Profile",
            description: error.message || "Could not delete operator profile.",
            variant: "destructive",
          });
        }
      }
    );
  };

  // Mutation hook for setting an active operator
  const useSetActiveOperator = () => {
    return useApiMutation<UserType, string>(
      '/operators/active', 
      {
        mutationFn: operatorService.setActiveOperator, 
        onSuccess: (updatedUser) => {
          queryClient.invalidateQueries({ queryKey: ['auth-status'] }); 
          queryClient.invalidateQueries({ queryKey: ['user', 'profile'] }); 
          queryClient.invalidateQueries({ queryKey: operatorKeys.lists() });
          toast({
            title: "Active Operator Set",
            description: `Operator "${updatedUser.activeOperatorDetail?.label || ''}" is now active.`
          });
        },
        onError: (error) => {
          toast({
            title: "Error Setting Active Operator",
            description: error.message || "Could not set active operator.",
            variant: "destructive",
          });
        }
      }
    );
  };

  return {
    useOperatorsQuery,
    useCreateOperator,
    useUpdateOperator,
    useDeleteOperator,
    useSetActiveOperator,
    service: operatorService, 
  };
}; 