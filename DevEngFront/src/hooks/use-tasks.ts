
import { useApiQuery, useApiMutation, useApiDelete, QueryKeyT } from './use-api';
import { TaskType } from '@/types/task';
import { 
  taskService,
  CreateTaskPayload, 
  UpdateTaskPayload 
} from '@/services/taskService';

export const useTasks = (projectId?: string) => {
  // Query hook for fetching all tasks, optionally filtered by project
  const useTasksQuery = () => {
    const endpoint = projectId ? `/tasks?projectId=${projectId}` : '/tasks';
    
    return useApiQuery<TaskType[]>(
      ['tasks', { projectId }],
      endpoint
    );
  };
  
  // Query hook for fetching a single task by ID
  const useTaskQuery = (id?: string) => {
    return useApiQuery<TaskType>(
      ['tasks', id],
      `/tasks/${id}`,
      {
        enabled: !!id
      }
    );
  };
  
  // Mutation hook for creating a new task
  const useCreateTask = () => {
    return useApiMutation<TaskType, CreateTaskPayload>(
      '/tasks',
      {
        onSuccess: () => {
          // Invalidate the tasks query to refetch the data
        },
      }
    );
  };
  
  // Mutation hook for updating a task
  const useUpdateTask = () => {
    return useApiMutation<TaskType, UpdateTaskPayload>(
      '/tasks',
      {
        onSuccess: (data, variables) => {
          // Invalidate the specific task query and the list
        },
      }
    );
  };
  
  // Mutation hook for deleting a task
  const useDeleteTask = () => {
    return useApiDelete<void>(
      '/tasks',
      {
        onSuccess: () => {
          // Invalidate the tasks query to refetch the data
        },
      }
    );
  };
  
  // Specialized mutation for completing a task
  const useCompleteTask = () => {
    return useApiMutation<TaskType, { taskId: string, completedByProtocol: string }>(
      '/tasks/complete',
      {
        mutationFn: async ({ taskId, completedByProtocol }) => {
          return await taskService.completeTask(taskId, completedByProtocol);
        },
        onSuccess: () => {
          // Invalidate the tasks queries
        },
      }
    );
  };
  
  // Specialized mutation for adding a message to a task
  const useAddMessageToTask = () => {
    return useApiMutation<TaskType, { taskId: string, messageId: string }>(
      '/tasks/message',
      {
        mutationFn: async ({ taskId, messageId }) => {
          return await taskService.addMessageToTask(taskId, messageId);
        },
        onSuccess: () => {
          // Invalidate the specific task query
        },
      }
    );
  };
  
  // Direct service access for more complex operations
  return {
    useTasksQuery,
    useTaskQuery,
    useCreateTask,
    useUpdateTask,
    useDeleteTask,
    useCompleteTask,
    useAddMessageToTask,
    service: taskService,
  };
};
