import { useApiQuery } from "@/hooks/use-api";

// AI Model interface
export interface AiModel {
  id: string;
  name: string;
  displayName: string;
  provider: string;
  description?: string;
  icon?: string; // optional icon if you have
}

interface AiModelsResponse {
  success: boolean;
  data: AiModel[];
}

// Query keys
export const aiModelKeys = {
  all: ["aiModels"] as const,
  detail: (id: string) => ["aiModels", id] as const,
};


export const useAiModels = () => {
  return useApiQuery<AiModelsResponse>(aiModelKeys.all, "/ai-models");
};

// Hook to fetch AI model by id (optional)
export const useAiModelById = (id: string) => {
  return useApiQuery<AiModel | undefined>(aiModelKeys.detail(id), `/ai-models?id=${id}`);
};
