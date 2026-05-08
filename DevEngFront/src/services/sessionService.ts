import apiClient from '@/lib/api';

// Define the structure of the session object, especially the meta field
export interface SessionMeta {
  enabledCastIds?: string[];
  // Add other meta properties if any
}

export interface SessionType {
  id: string;
  userId: string;
  title: string;
  meta: SessionMeta;
  parentId?: string | null;
  rootId?: string | null;
  createdAt: string; // Assuming ISO date string
  updatedAt: string; // Assuming ISO date string
  // children?: Partial<SessionType>[]; // Removed direct children
  branchSessions?: Omit<SessionType, 'branchSessions'>[]; // Flat list of all sessions in the branch
  // Add other session properties if any
}

const API_BASE_URL = '/sessions';

/**
 * Fetches a single session by its ID.
 */
const getSession = async (sessionId: string): Promise<SessionType> => {
  const response = await apiClient.get<SessionType>(`${API_BASE_URL}/${sessionId}`);
  return response.data;
};

/**
 * Updates the metadata of a specific session.
 * It fetches the current session, merges the new meta with existing meta,
 * and then sends a PUT request.
 */
const updateSessionMeta = async (
  sessionId: string,
  newMeta: Partial<SessionMeta> // Allow updating parts of meta, e.g., just enabledCastIds
): Promise<SessionType> => {
  const currentSession = await getSession(sessionId);
  
  const updatedMeta = {
    ...currentSession.meta,
    ...newMeta,
  };

  const response = await apiClient.put<SessionType>(`${API_BASE_URL}/${sessionId}`, {
    meta: updatedMeta, 
  });
  return response.data;
};

interface ForkSessionPayload {
  title?: string;
  copyDepth?: number;
}

/**
 * Forks a session, creating a new child session.
 * @param sessionId The ID of the session to fork.
 * @param title Optional title for the new forked session.
 * @param copyDepth Optional number of messages to copy from the parent (defaults to backend default).
 * @returns The ID of the new forked session.
 */
const forkSession = async (
  sessionId: string, 
  title?: string, 
  copyDepth?: number
): Promise<{ sessionId: string }> => {
  const payload: ForkSessionPayload = {};
  if (title) payload.title = title;
  if (copyDepth !== undefined) payload.copyDepth = copyDepth;

  const response = await apiClient.post<{ sessionId: string }>(
    `${API_BASE_URL}/${sessionId}/fork`,
    payload
  );
  return response.data;
};

/**
 * Deletes a session by its ID.
 * @param sessionId The ID of the session to delete.
 */
const deleteSession = async (sessionId: string): Promise<void> => {
  await apiClient.delete(`${API_BASE_URL}/${sessionId}`);
};

export const sessionService = {
  getSession,
  updateSessionMeta,
  forkSession,
  deleteSession,
};
 