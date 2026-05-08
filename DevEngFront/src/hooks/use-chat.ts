import { useState, useCallback } from "react";
import { nanoid } from "nanoid";
import { apiClient } from "./use-api";
import { useToast } from "./use-toast";
import {
  createParser,
  type EventSourceParser,
  type EventSourceMessage,
} from "eventsource-parser";

export interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "agent";
  agentId?: string;
  timestamp: Date;
  taskId?: string;
  isStreaming?: boolean;
}

export interface SendMessageOptions {
  agents: string[];
  taskTitle?: string;
  taskId?: string;
  projectId: string;
}

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const updateStreamingMessage = useCallback((id: string, content: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id
          ? { ...msg, content: msg.content + content, isStreaming: true }
          : msg
      )
    );
  }, []);

  const finalizeStreamingMessage = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, isStreaming: false } : msg))
    );
  }, []);

  const sendMessage = useCallback(
    async (content: string, options: SendMessageOptions) => {
      try {
        setIsLoading(true);

        // Add user message immediately
        const userMessageId = nanoid();
        const userMessage: ChatMessage = {
          id: userMessageId,
          content,
          sender: "user",
          timestamp: new Date(),
          taskId: options.taskId,
        };

        addMessage(userMessage);

        // Map to store message IDs by speaker
        const speakerMessageMap = new Map<string, string>();

        // For each selected agent, create a streaming response
        for (const agentId of options.agents) {
          try {
            // Set up streaming request
            const response = await fetch(
              `${apiClient.defaults.baseURL}/chat/stream`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  ...(apiClient.defaults.headers.common["Authorization"]
                    ? {
                        Authorization: apiClient.defaults.headers.common[
                          "Authorization"
                        ] as string,
                      }
                    : {}),
                },
                body: JSON.stringify({
                  message: content,
                  agentId,
                  projectId: options.projectId,
                  taskId: options.taskId,
                  taskTitle: options.taskTitle,
                }),
              }
            );

            if (!response.ok || !response.body) {
              throw new Error(`Server responded with ${response.status}`);
            }

            // Create an SSE parser to handle the events
            const parser = createParser({
              onEvent: (event: EventSourceMessage) => {
                try {
                  const data = JSON.parse(event.data);

                  switch (event.event) {
                    case "speaker": {
                      // Create a new message for this speaker
                      const speakerMessageId = nanoid();
                      const speakerMessage: ChatMessage = {
                        id: speakerMessageId,
                        content: "",
                        sender: "agent",
                        agentId,
                        timestamp: new Date(),
                        taskId: options.taskId,
                        isStreaming: true,
                      };

                      addMessage(speakerMessage);

                      // Store the message ID for this speaker's stream ID
                      speakerMessageMap.set(data.id, speakerMessageId);

                      if (options.taskId) {
                        // You might need to implement this function
                        // addMessageToTask(options.taskId, speakerMessageId);
                      }
                      break;
                    }

                    case "text": {
                      // Add the text token to the message with the corresponding ID
                      const messageId = speakerMessageMap.get(data.id);
                      if (messageId && data.content) {
                        updateStreamingMessage(messageId, data.content);
                      }
                      break;
                    }

                    case "end": {
                      // Mark all streaming messages as complete
                      speakerMessageMap.forEach((msgId) => {
                        finalizeStreamingMessage(msgId);
                      });
                      break;
                    }

                    case "error": {
                      // Handle error
                      speakerMessageMap.forEach((msgId) => {
                        updateStreamingMessage(
                          msgId,
                          "\n[Error: Connection interrupted]"
                        );
                        finalizeStreamingMessage(msgId);
                      });

                      toast({
                        title: "Communication Error",
                        description:
                          data.error || "Failed to stream agent response",
                        variant: "destructive",
                      });
                      break;
                    }
                  }
                } catch (error) {
                  console.error("Error parsing SSE event:", error, event);
                }
              },
            });

            // Process the stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
              const { done, value } = await reader.read();

              if (done) {
                // Ensure all messages are finalized even if no end event
                speakerMessageMap.forEach((msgId) => {
                  finalizeStreamingMessage(msgId);
                });
                break;
              }

              // Decode the chunk and feed it to the parser
              const chunk = decoder.decode(value, { stream: true });
              parser.feed(chunk);
            }
          } catch (error) {
            console.error("Error during streaming:", error);

            // Add an error message if no messages were created
            if (speakerMessageMap.size === 0) {
              const errorMessageId = nanoid();
              const errorMessage: ChatMessage = {
                id: errorMessageId,
                content:
                  "Sorry, I encountered an error while generating a response.",
                sender: "agent",
                agentId,
                timestamp: new Date(),
                taskId: options.taskId,
                isStreaming: false,
              };

              addMessage(errorMessage);
            }

            toast({
              title: "Communication Error",
              description: "Failed to stream agent response. Please try again.",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error("Error sending message:", error);
        // toast({
        //   title: "Error",
        //   description: "Failed to send message. Please try again.",
        //   variant: "destructive"
        // });
      } finally {
        setIsLoading(false);
      }
    },
    [addMessage, updateStreamingMessage, finalizeStreamingMessage, toast]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  };
};
