
import apiClient from '@/lib/api';
import { TaskType } from '@/types/task';

// Type definitions
export interface CreateTaskPayload {
  name: string;
  description: string;
  projectId: string;
  createdByProtocol: string;
}

export interface UpdateTaskPayload {
  id: string;
  name?: string;
  description?: string;
  status?: 'active' | 'completed';
  completedByProtocol?: string;
  associatedMessages?: string[];
}

// API endpoints
const TASKS_ENDPOINT = '/tasks';

// Task service functions
export const taskService = {
  // Get all tasks
  getTasks: async (projectId?: string): Promise<TaskType[]> => {
    const url = projectId ? `${TASKS_ENDPOINT}?projectId=${projectId}` : TASKS_ENDPOINT;
    const response = await apiClient.get(url);
    return response.data;
  },
  
  // Get a single task by ID
  getTask: async (id: string): Promise<TaskType> => {
    const response = await apiClient.get(`${TASKS_ENDPOINT}/${id}`);
    return response.data;
  },
  
  // Create a new task
  createTask: async (data: CreateTaskPayload): Promise<TaskType> => {
    const response = await apiClient.post(TASKS_ENDPOINT, data);
    return response.data;
  },
  
  // Update a task
  updateTask: async (data: UpdateTaskPayload): Promise<TaskType> => {
    const response = await apiClient.put(`${TASKS_ENDPOINT}/${data.id}`, data);
    return response.data;
  },
  
  // Delete a task
  deleteTask: async (id: string): Promise<void> => {
    await apiClient.delete(`${TASKS_ENDPOINT}/${id}`);
  },
  
  // Add a message to a task
  addMessageToTask: async (taskId: string, messageId: string): Promise<TaskType> => {
    const response = await apiClient.post(`${TASKS_ENDPOINT}/${taskId}/messages`, { messageId });
    return response.data;
  },
  
  // Complete a task
  completeTask: async (taskId: string, completedByProtocol: string): Promise<TaskType> => {
    const response = await apiClient.post(`${TASKS_ENDPOINT}/${taskId}/complete`, { completedByProtocol });
    return response.data;
  },
};
