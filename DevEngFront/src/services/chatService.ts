import apiClient from "@/lib/api";

export interface BackendMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string; // This will be the consolidated content
  rawContent?: { messages: Array<{ name: string; text: string }> } | null; // Updated rawContent type
  createdAt: string; // ISO string

  files?: Array<{
    id: string;
    originalName: string;
    uniqueName: string;
    messageId: string;
    createdAt: string;
  }>; // 
}

export interface GetMessagesResponse {
  messages: BackendMessage[];
  nextCursor: string | null;

}

const getMessages = async (
  sessionId: string,
  cursor?: string,
  limit: number = 20
): Promise<GetMessagesResponse> => {
  const params = new URLSearchParams();
  if (cursor) {
    params.append("cursor", cursor);
  }
  params.append("limit", limit.toString());

  // The backend route is /api/sessions/:id/messages
  // apiClient already prepends /api, so just use /sessions/...
  const response = await apiClient.get<GetMessagesResponse>(
    `/sessions/${sessionId}/messages?${params.toString()}`
  );
  return response.data;
};

export const chatService = {
  getMessages,
};
