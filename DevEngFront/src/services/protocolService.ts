import apiClient from "@/lib/api";

// Type definitions matching the backend IProtocol interface
export interface ProtocolType {
  id: string;
  userId?: string | null;
  name: string;
  aiModelId?: string;
  description: string;
  level: 1 | 2 | 3;
  type: "static" | "semi-dynamic" | "compositional";
  promptTemplate: string;
  inputs?: {
    name: string;
    type: "text" | "select" | "number" | "boolean";
    label: string;
    required: boolean;
    options?: string[];
    placeholder?: string;
    defaultValue?: string | number | boolean;
  }[];
  modifiers?: {
    name: string;
    type: "select" | "toggle" | "slider";
    label: string;
    options?: string[];
    defaultValue?: string | number | boolean;
    min?: number;
    max?: number;
  }[];
  logic?: {
    conditions?: {
      field: string;
      operator:
        | "equals"
        | "not_equals"
        | "contains"
        | "greater_than"
        | "less_than";
      value: string | number | boolean;
      action: string;
    }[];
    iterations?: {
      enabled: boolean;
      maxIterations: number;
      showProgress: boolean;
    };
    chaining?: {
      enabled: boolean;
      steps: {
        name: string;
        promptTemplate: string;
        dependsOn?: string[];
      }[];
    };
  };
  deliveredBy?: string;
  category?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deductedDucks?:string;
}

export interface CreateProtocolPayload {
  name: string;
  description: string;
  level: 1 | 2 | 3;
  type: "static" | "semi-dynamic" | "compositional";
  promptTemplate: string;
  inputs?: ProtocolType["inputs"];
  modifiers?: ProtocolType["modifiers"];
  logic?: ProtocolType["logic"];
  deliveredBy?: string;
  category?: string;
  aiModelId?: string; 
}

export interface UpdateProtocolPayload extends Partial<CreateProtocolPayload> {
  id: string;
  aiModelId?: string;
}

// API endpoints
const PROTOCOLS_ENDPOINT = "/protocols";

// Protocol service functions
export const protocolService = {
  // Get all protocols
  getProtocols: async (): Promise<ProtocolType[]> => {
    const response = await apiClient.get(PROTOCOLS_ENDPOINT);
    return response.data;
  },

  // Get a single protocol by ID
  getProtocol: async (id: string): Promise<ProtocolType> => {
    const response = await apiClient.get(`${PROTOCOLS_ENDPOINT}/${id}`);
    return response.data;
  },

  // Get protocols by category
  getProtocolsByCategory: async (category: string): Promise<ProtocolType[]> => {
    const response = await apiClient.get(
      `${PROTOCOLS_ENDPOINT}/category/${category}`
    );
    return response.data;
  },

  // Get protocols by level
  getProtocolsByLevel: async (level: 1 | 2 | 3): Promise<ProtocolType[]> => {
    const response = await apiClient.get(
      `${PROTOCOLS_ENDPOINT}/level/${level}`
    );
    return response.data;
  },

  // Create a new protocol
  createProtocol: async (
    data: CreateProtocolPayload
  ): Promise<ProtocolType> => {
    const response = await apiClient.post(PROTOCOLS_ENDPOINT, data);
    return response.data;
  },

  // Update a protocol
  updateProtocol: async (
    data: UpdateProtocolPayload
  ): Promise<ProtocolType> => {
    const response = await apiClient.put(
      `${PROTOCOLS_ENDPOINT}/${data.id}`,
      data
    );
    return response.data;
  },
  // Delete a protocol
  deleteProtocol: async (id: string): Promise<void> => {
    await apiClient.delete(`${PROTOCOLS_ENDPOINT}/${id}`);
  },
};
