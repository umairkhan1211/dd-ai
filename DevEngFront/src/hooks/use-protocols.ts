import { useApiQuery, useApiMutation, useApiUpdate, useApiDelete, QueryKeyT, apiClient } from './use-api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { 
  protocolService, 
  ProtocolType,
  CreateProtocolPayload, 
  UpdateProtocolPayload 
} from '@/services/protocolService';

export const useProtocols = () => {
  // Query hook for fetching all protocols
  const useProtocolsQuery = () => {
    return useApiQuery<ProtocolType[]>(
      ['protocols'],
      '/protocols'
    );
  };
  
  // Query hook for fetching a single protocol by ID
  const useProtocolQuery = (id?: string) => {
    return useApiQuery<ProtocolType>(
      ['protocols', id],
      `/protocols/${id}`,
      {
        enabled: !!id
      }
    );
  };
  
  // Mutation hook for creating a new protocol
  const useCreateProtocol = () => {
    return useApiMutation<ProtocolType, CreateProtocolPayload>(
      '/protocols',
      {
        onSuccess: () => {
          // Invalidate the protocols query to refetch the data
        },
      }
    );
  };
  
  // Mutation hook for updating a protocol
  const useUpdateProtocol = () => {
    const queryClient = useQueryClient();
    
    return useMutation<ProtocolType, AxiosError, UpdateProtocolPayload>({
      mutationFn: async (variables) => {
        const { id, ...updateData } = variables;
        const response = await apiClient.put<ProtocolType>(`/protocols/${id}`, updateData);
        return response.data;
      },
      onSuccess: (data, variables) => {
        // Invalidate the specific protocol query and the list
        queryClient.invalidateQueries({ queryKey: ['protocols'] });
        queryClient.invalidateQueries({ queryKey: ['protocols', variables.id] });
      },
    });
  };
  
  // Mutation hook for deleting a protocol
  const useDeleteProtocol = () => {
    return useApiDelete<void>(
      '/protocols',
      {
        onSuccess: () => {
          // Invalidate the protocols query to refetch the data
        },
      }
    );
  };
  
  // Direct service access for more complex operations
  return {
    useProtocolsQuery,
    useProtocolQuery,
    useCreateProtocol,
    useUpdateProtocol,
    useDeleteProtocol,
    service: protocolService,
  };
};
