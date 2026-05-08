
import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { AxiosError } from 'axios';

// Type definitions
export type QueryKeyT = readonly unknown[];
export type ApiError = AxiosError;

// Generic GET request hook
export function useApiQuery<TData = unknown>(
  queryKey: QueryKeyT,
  url: string,
  options?: Omit<UseQueryOptions<TData, ApiError, TData, QueryKeyT>, 'queryKey' | 'queryFn'>
) {
  return useQuery<TData, ApiError, TData, QueryKeyT>({
    queryKey,
    queryFn: async () => {
      const response = await apiClient.get<TData>(url);
      return response.data;
    },
    ...options,
  });
}

// Generic POST mutation hook
export function useApiMutation<TData = unknown, TVariables = unknown>(
  url: string,
  options?: UseMutationOptions<TData, ApiError, TVariables>
) {
  const queryClient = useQueryClient();
  
  return useMutation<TData, ApiError, TVariables>({
    mutationFn: async (variables) => {
      const response = await apiClient.post<TData>(url, variables);
      return response.data;
    },
    onSettled: (_, error, variables, context) => {
      // Extract the resource type from the URL (e.g., '/projects' -> 'projects')
      const resource = url.split('/')[1];
      if (resource && !error) {
        // Invalidate queries related to this resource
        queryClient.invalidateQueries({ queryKey: [resource] });
      }
      
      // Call the original onSettled if provided
      options?.onSettled?.(_, error, variables, context);
    },
    ...options,
  });
}

// Generic PUT mutation hook
export function useApiUpdate<TData = unknown, TVariables = unknown>(
  url: string,
  options?: UseMutationOptions<TData, ApiError, TVariables>
) {
  const queryClient = useQueryClient();
  
  return useMutation<TData, ApiError, TVariables>({
    mutationFn: async (variables) => {
      const response = await apiClient.put<TData>(url, variables);
      return response.data;
    },
    onSettled: (data, error, variables, context) => {
      // Extract the resource type from the URL (e.g., '/projects' -> 'projects')
      const resource = url.split('/')[1];
      if (resource && !error) {
        // Invalidate queries related to this resource
        queryClient.invalidateQueries({ queryKey: [resource] });
      }
      
      // Call the original onSettled if provided
      options?.onSettled?.(data, error, variables, context);
    },
    ...options,
  });
}

// Generic DELETE mutation hook
export function useApiDelete<TData = unknown>(
  url: string,
  options?: UseMutationOptions<TData, ApiError, string | number>
) {
  const queryClient = useQueryClient();
  
  return useMutation<TData, ApiError, string | number>({
    mutationFn: async (id) => {
      const response = await apiClient.delete<TData>(`${url}/${id}`);
      return response.data;
    },
    onSettled: (data, error, variables, context) => {
      // Extract the resource type from the URL (e.g., '/projects' -> 'projects')
      const resource = url.split('/')[1];
      if (resource && !error) {
        // Invalidate queries related to this resource
        queryClient.invalidateQueries({ queryKey: [resource] });
      }
      
      // Call the original onSettled if provided
      options?.onSettled?.(data, error, variables, context);
    },
    ...options,
  });
}

// Export axios instance for direct usage when needed
export { apiClient };
