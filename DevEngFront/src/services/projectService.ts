import apiClient from '@/lib/api';
import { ProjectType } from '@/components/projects/ProjectCard';

// Type definitions
export interface CreateProjectPayload {
  title: string;
  description?: string;
  avatar?: string | null;
  meta?: Record<string, any>;
}

export interface UpdateProjectPayload {
  id: string;
  title: string;
  description?: string;
  avatar?: string | null;
  meta?: Record<string, any>;
}

export interface ChatSession {
  id: string;
  title?: string;
  createdAt: string;
  avatar?: string | null;
  meta?: {
    description?: string;
    agentCount?: number;
    [key: string]: any;
  };
}


// API endpoints
const SESSIONS_ENDPOINT = '/sessions';


// Project service functions
export const projectService = {
  // Get all projects (chat sessions)
 
  getProjects: async (): Promise<ProjectType[]> => {
  const response = await apiClient.get(SESSIONS_ENDPOINT);

  return response.data.sessions.map((session: ChatSession) => {
    const parsedMeta = typeof session.meta === "string" ? JSON.parse(session.meta) : session.meta || {};

    return {
      id: session.id,
      title: session.title || "Untitled Project",
      description: parsedMeta.description || "",
      agentCount: parsedMeta.agentCount || 0,
      createdAt: new Date(session.createdAt),
      avatar: session.avatar || null,
    };
  });
},
  // Get a single project by ID

getProject: async (id: string): Promise<ProjectType> => {
  const response = await apiClient.get(`${SESSIONS_ENDPOINT}/${id}`);
  const session = response.data as ChatSession;

  const parsedMeta = typeof session.meta === "string" ? JSON.parse(session.meta) : session.meta || {};

  return {
    id: session.id,
    title: session.title || "Untitled Project",
    description: parsedMeta.description || "",
    agentCount: parsedMeta.agentCount || 0,
    createdAt: new Date(session.createdAt),
    avatar: session.avatar || null,
  };
  },

  // Create a new project
  createProject: async (data: FormData): Promise<ProjectType> => {
    const response = await apiClient.post(SESSIONS_ENDPOINT, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const sessionId = response.data.sessionId;

    // Fetch full session data from backend
    const sessionResp = await apiClient.get(`${SESSIONS_ENDPOINT}/${sessionId}`);
    const session = sessionResp.data as ChatSession;

    return {
      id: session.id,
      title: session.title || "Untitled Project",
      description: session.meta?.description || "",
      agentCount: session.meta?.agentCount || 0,
      createdAt: new Date(session.createdAt),
      avatar: session.avatar || null,
    };
  },


  // Update a project
  updateProject: async (data: UpdateProjectPayload): Promise<ProjectType> => {
    const response = await apiClient.put(`${SESSIONS_ENDPOINT}/${data.id}`, {
      title: data.title,
      avatar: data.avatar || null,
      meta: {
        description: data.description || "",
        ...data.meta,
      },
    });

    return {
      id: data.id,
      title: data.title,
      description: data.description || "",
      agentCount: (data.meta?.agentCount as number) || 0,
      createdAt: new Date(),
      avatar: data.avatar || null,
    };
  },

  // Delete a project
  deleteProject: async (id: string): Promise<void> => {
    await apiClient.delete(`${SESSIONS_ENDPOINT}/${id}`);
  },
};
