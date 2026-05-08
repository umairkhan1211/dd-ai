import apiClient from '@/lib/api';
import { UserType } from '../types/user'; // Using relative path

// Define the Operator Profile structure based on OperatorProfile.tsx and backend
export interface OperatorProfileData {
  name: string;
  traits: string;
  languagePreferences: string;
  failureStates: string[];
  successTriggers: string[];
  rules: string[];
  settings: {
    recursiveProcessing: boolean;
  };
}

// Define the Operator type
export interface OperatorType {
  id: string;
  userId: string;
  label: string; // This will be the user-defined name for the operator profile
  profile: OperatorProfileData;
  createdAt: string;
  updatedAt: string;
}

// Payload for creating an operator
export interface CreateOperatorPayload {
  label: string;
  profile: OperatorProfileData;
}

// Payload for updating an operator
export interface UpdateOperatorPayload {
  id: string;
  label?: string;
  profile?: Partial<OperatorProfileData>;
}

const API_BASE_URL = '/operators';

// Service methods
const getOperators = async (): Promise<OperatorType[]> => {
  const response = await apiClient.get<OperatorType[]>(API_BASE_URL);
  return response.data;
};

const createOperator = async (payload: CreateOperatorPayload): Promise<OperatorType> => {
  const response = await apiClient.post<OperatorType>(API_BASE_URL, payload);
  return response.data;
};

const updateOperator = async ({ id, ...payload }: UpdateOperatorPayload): Promise<OperatorType> => {
  const response = await apiClient.put<OperatorType>(`${API_BASE_URL}/${id}`, payload);
  return response.data;
};

const deleteOperator = async (operatorId: string): Promise<void> => {
  await apiClient.delete(`${API_BASE_URL}/${operatorId}`);
};

const setActiveOperator = async (operatorId: string): Promise<UserType> => {
  // Assuming UserType is the response, which includes the updated user with activeOperatorDetail
  const response = await apiClient.put<UserType>(`${API_BASE_URL}/active/${operatorId}`);
  return response.data;
};

export const operatorService = {
  getOperators,
  createOperator,
  updateOperator,
  deleteOperator,
  setActiveOperator,
}; 