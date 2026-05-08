import { createParser, EventSourceParser, EventSourceMessage } from 'eventsource-parser';

/**
 * Interface for a chat message
 */
export interface ChatMessage {
  id: string;
  name: string;
  content: string;
  timestamp?: Date;
}

/**
 * Type for a function that adds a new bubble to the chat
 */
export type AddBubbleFunction = (id: string, name: string, timestamp?: Date) => void;

/**
 * Type for a function that appends text to an existing bubble
 */
export type AppendTextFunction = (id: string, content: string) => void;

/**
 * Type for a function that marks a bubble as complete
 */
export type FinishBubbleFunction = (id: string) => void;

/**
 * Type for a function that handles errors in the stream
 */
export type HandleErrorFunction = (error: string) => void;

/**
 * Streams chat from the given URL and calls the provided callbacks when events occur
 * @param url The URL to stream from
 * @param addBubble Callback to add a new chat bubble
 * @param appendText Callback to append text to an existing bubble
 * @param finishBubble Callback to mark a bubble as complete
 * @param handleError Optional callback for error handling
 * @param body Optional body for the POST request
 */
export function streamChat(
  url: string, 
  addBubble: AddBubbleFunction, 
  appendText: AppendTextFunction, 
  finishBubble: FinishBubbleFunction,
  handleError?: HandleErrorFunction,
  body?: object
): AbortController {
  const abortController = new AbortController();
  
  fetch(url, { 
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
    credentials: 'include',
    signal: abortController.signal
  }).then(async (res) => {
    if (!res.ok) {
      const errorText = await res.text();
      if (handleError) {
        handleError(errorText || `Error ${res.status}: ${res.statusText}`);
      }
      return;
    }
    
    const parser = createParser({
      onEvent: (event: EventSourceMessage) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (event.event) {
            case 'speaker':
              addBubble(data.id, data.name, new Date());
              break;
            case 'text':
              appendText(data.id, data.content);
              break;
            case 'end':
              finishBubble(data.id);
              break;
            case 'error':
              if (handleError) {
                handleError(data.error || 'Unknown error');
              }
              break;
          }
        } catch (error) {
          console.error('Error parsing SSE event:', error, event);
          if (handleError) {
            handleError('Failed to parse server response');
          }
        }
      }
    });

    // Read the response as a stream and feed it to the parser
    const reader = res.body?.getReader();
    if (!reader) {
      if (handleError) {
        handleError('Failed to read response stream');
      }
      return;
    }
    
    try {
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        parser.feed(chunk);
      }
    } catch (error: Error | unknown) {
      if (error instanceof Error && error.name !== 'AbortError' && handleError) {
        handleError('Stream connection error');
      }
    } finally {
      reader.releaseLock();
    }
  }).catch((error: Error | unknown) => {
    if (error instanceof Error && error.name !== 'AbortError' && handleError) {
      handleError(`Stream fetch error: ${error.message}`);
    }
  });
  
  return abortController;
}

/**
 * Creates a full message object from a streamed chat response
 * @param url The URL to stream from
 * @returns A promise resolving to the complete message
 */
export function streamToCompleteChatMessage(url: string): Promise<ChatMessage> {
  return new Promise((resolve, reject) => {
    const message: Partial<ChatMessage> = {};
    
    const abortController = streamChat(
      url,
      (id, name) => {
        message.id = id;
        message.name = name;
        message.content = '';
        message.timestamp = new Date();
      },
      (id, content) => {
        if (message.content !== undefined) {
          message.content += content;
        }
      },
      (id) => {
        if (message.id === id && message.name && message.content !== undefined) {
          resolve(message as ChatMessage);
        } else {
          reject(new Error('Incomplete message received'));
        }
      },
      (error) => {
        reject(new Error(error));
      }
    );
    
    // Allow aborting the promise but in a type-safe way
    (message as unknown as { abort: () => void }).abort = () => {
      abortController.abort();
      reject(new Error('Stream aborted'));
    };
  });
} 