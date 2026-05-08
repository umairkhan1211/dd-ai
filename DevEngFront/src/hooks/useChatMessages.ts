import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  InfiniteData,
} from "@tanstack/react-query";
import {
  chatService,
  BackendMessage,
  GetMessagesResponse,
} from "@/services/chatService";
import { ChatMessage } from "@/components/chat/ChatInterface";

// Helper function (unchanged)
const mapBackendMessageToChatMessage = (
  backendMsg: BackendMessage,
  subMessageIndex?: number
): ChatMessage[] => {

  const baseFiles = backendMsg.files?.map((f) => ({
    id: f.id,
    originalName: f.originalName,
    uniqueName: f.uniqueName,
    createdAt: f.createdAt,
  })) ?? [];

  if (backendMsg.role === "assistant" && backendMsg.rawContent) {
    const rawContent = backendMsg.rawContent as Record<string, unknown>;
    let messages: Array<{ name: string; text: string }> = [];

    const parsedContent = rawContent.parsedContent as
      | Record<string, unknown>
      | undefined;
    if (
      parsedContent &&
      parsedContent.messages &&
      Array.isArray(parsedContent.messages)
    ) {
      messages = parsedContent.messages as Array<{
        name: string;
        text: string;
      }>;
    } else if (rawContent.messages && Array.isArray(rawContent.messages)) {
      messages = rawContent.messages as Array<{ name: string; text: string }>;
    }

    if (messages.length > 0) {
      return messages.map((subMsg, index) => ({
        id: `${backendMsg.id}-${subMsg.name.replace(/\s+/g, "_")}-${index}`,
        content: subMsg.text,
        sender: "agent",
        agentId: undefined,
        speakerName: subMsg.name,
        timestamp: new Date(backendMsg.createdAt),
        isStreaming: false,
        files: baseFiles,
      }));
    }
  }

  return [
    {
      id: backendMsg.id,
      content: backendMsg.content,
      sender: backendMsg.role === "user" ? "user" : "agent",
      agentId: backendMsg.role === "assistant" ? undefined : undefined,
      speakerName: undefined,
      timestamp: new Date(backendMsg.createdAt),
      isStreaming: false,
      files: baseFiles,
    },
  ];
};

interface PageData {
  messages: ChatMessage[];
  nextCursor: string | null | undefined;
}

export const useChatMessages = (sessionId: string) => {
  const queryOptions: UseInfiniteQueryOptions<
    PageData,
    Error,
    InfiniteData<PageData>,
    PageData,
    readonly (string | undefined)[],
    string | undefined
  > = {
    queryKey: ["chatMessages", sessionId],
    queryFn: async ({ pageParam }): Promise<PageData> => {
      const data: GetMessagesResponse = await chatService.getMessages(
        sessionId,
        pageParam
      );

      const allMappedMessages = data.messages.flatMap((msg) =>
        mapBackendMessageToChatMessage(msg)
      );

      return {
        messages: allMappedMessages,
        nextCursor: data.nextCursor,
      };
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage: PageData) => lastPage.nextCursor,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: "always",
  };

  return useInfiniteQuery(queryOptions);
};
