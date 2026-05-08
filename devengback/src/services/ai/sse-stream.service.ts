import { Response } from 'express';
import crypto from 'crypto';
import { Message } from '../../models';
import logger from '../../utils/logger';
import { parser as jsonStreamParser } from 'stream-json';

/**
 * Service to handle SSE streaming for AI responses with token-by-token streaming
 * Adapted for OpenAI Responses API format
 */
export class SSEStreamService {
  /**
   * Converts an OpenAI Responses API stream to SSE events with token-by-token streaming
   * @param res Express response object
   * @param openaiStream Stream from OpenAI Responses API
   * @param sessionId Session ID to save the message to
   * @returns Promise<string | null> The response ID for conversation continuity
   */
  async pipeOpenAIToSSE(
    res: Response,
    openaiStream: any,
    sessionId?: string
  ): Promise<{
    responseId: string | null;
    inputTokens: number;
    outputTokens: number;
    modelUsed: string | null;
  }> {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream;charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    const baseMessageId = crypto.randomUUID();
    let messageCounter = 0;
    let responseId: string | null = null;
    let inputTokens: number = 0;
    let outputTokens: number = 0;
    let modelUsed: string | null = null;
    const completeMessages: Record<string, { name: string; text: string }> = {};
    let accumulatedRawJson = '';

    const send = (event: string, data: object) => {
      if (res.writableEnded) {
        logger.warn('SSE: Attempted to write to an already ended response stream.');
        return;
      }
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    const sjsonParser = jsonStreamParser({ jsonStreaming: true });

    const parserState = {
      expectTopLevelObject: true,
      expectMessagesKey: false,
      inMessagesArray: false,
      inMessageObject: false,
      currentKey: null as string | null,
      activeMessage: null as { id: string; name: string; text: string } | null,
      isStreamingText: false,
    };

    sjsonParser.on('data', (data: { name: string; value: any }) => {
      switch (data.name) {
        case 'startObject':
          if (parserState.expectTopLevelObject) {
            parserState.expectTopLevelObject = false;
            parserState.expectMessagesKey = true;
          } else if (parserState.inMessagesArray && !parserState.inMessageObject) {
            parserState.inMessageObject = true;
            messageCounter++;
            parserState.activeMessage = { id: '', name: '', text: '' };
          }
          break;

        case 'endObject':
          if (parserState.inMessageObject) {
            parserState.inMessageObject = false;
            parserState.activeMessage = null;
            parserState.currentKey = null;
          }
          break;

        case 'startArray':
          if (parserState.expectMessagesKey && parserState.currentKey === 'messages') {
            parserState.inMessagesArray = true;
            parserState.expectMessagesKey = false;
          }
          break;

        case 'endArray':
          if (parserState.inMessagesArray) {
            parserState.inMessagesArray = false;
          }
          break;

        case 'keyValue':
          parserState.currentKey = data.value.toString();
          break;

        case 'stringValue':
          const strValue = data.value.toString();
          if (
            parserState.inMessageObject &&
            parserState.activeMessage &&
            parserState.currentKey === 'name'
          ) {
            if (!parserState.activeMessage.id) {
              parserState.activeMessage.name = strValue;
              parserState.activeMessage.id = `${baseMessageId}-${messageCounter - 1}`;
              send('speaker', {
                id: parserState.activeMessage.id,
                name: parserState.activeMessage.name,
              });
              completeMessages[parserState.activeMessage.id] = {
                name: parserState.activeMessage.name,
                text: '',
              };
              logger.info(
                `SSE: Speaker: ${parserState.activeMessage.name} (ID: ${parserState.activeMessage.id})`
              );
            }
          } else if (
            parserState.isStreamingText &&
            parserState.activeMessage &&
            parserState.activeMessage.id
          ) {
            if (parserState.activeMessage.text === '' && strValue.length > 0) {
              send('text', { id: parserState.activeMessage.id, content: strValue });
              parserState.activeMessage.text = strValue;
              if (completeMessages[parserState.activeMessage.id]) {
                completeMessages[parserState.activeMessage.id].text = strValue;
              }
            }
          }
          break;

        case 'startString':
          if (
            parserState.inMessageObject &&
            parserState.activeMessage &&
            parserState.currentKey === 'text'
          ) {
            parserState.isStreamingText = true;
            if (
              parserState.activeMessage.id &&
              completeMessages[parserState.activeMessage.id] &&
              completeMessages[parserState.activeMessage.id].text === undefined
            ) {
              completeMessages[parserState.activeMessage.id].text = '';
            }
          }
          break;

        case 'stringChunk':
          const token = data.value.toString();
          if (
            parserState.isStreamingText &&
            parserState.activeMessage &&
            parserState.activeMessage.id
          ) {
            send('text', { id: parserState.activeMessage.id, content: token });
            parserState.activeMessage.text += token;
            if (completeMessages[parserState.activeMessage.id]) {
              completeMessages[parserState.activeMessage.id].text = parserState.activeMessage.text;
            }
          }
          break;

        case 'endString':
          if (parserState.isStreamingText) {
            parserState.isStreamingText = false;
          }
          break;
      }
    });

    sjsonParser.on('error', (err: any) => {
      logger.error('SJSON_ERROR: Error parsing JSON stream:', err);
    });

    try {
      logger.info('SSE: Starting to process OpenAI Responses API stream with JSON parser.');

      for await (const event of openaiStream) {
        if (res.writableEnded) {
          logger.warn('SSE: Response stream ended prematurely during OpenAI stream processing.');
          break;
        }

        // Handle different event types from Responses API
        let contentToParse: string | undefined = undefined;

        switch (event.type) {
          case 'response.created':
            responseId = event.response.id;
            logger.info(`SSE: Response created with ID: ${responseId}`);
            break;

          case 'response.output_text.delta':
            // This is the text content we want to parse
            const textDelta = event.delta;
            if (textDelta) {
              contentToParse = textDelta;
              accumulatedRawJson += textDelta;
            }
            break;

          case 'response.output_text.done':
            logger.info('SSE: Text output completed');
            break;

          case 'response.completed':
            inputTokens = event.response?.usage?.input_tokens ?? null;
            outputTokens = event.response?.usage?.output_tokens ?? null;
            modelUsed = event.response?.model ?? null;
            logger.info('SSE: Response completed');
            break;

          case 'response.failed':
            logger.error('SSE: Response failed:', event.error);
            send('error', { id: baseMessageId, error: 'Response failed' });
            break;

          case 'error':
            logger.error('SSE: Stream error:', event.error);
            send('error', { id: baseMessageId, error: 'Stream error' });
            break;

          default:
            logger.debug(`SSE: Unhandled event type: ${event.type}`);
            break;
        }

        // Parse the text content if we have any
        if (contentToParse) {
          sjsonParser.write(contentToParse);
        }
      }

      logger.info('SSE: OpenAI Responses API stream processing loop finished.');
      if (!res.writableEnded) {
        send('end', { id: baseMessageId, responseId: responseId });
        logger.info(`SSE: Sent 'end' event for ${baseMessageId} with response ID: ${responseId}`);

        if (sessionId) {
          await this.saveMessagesToDatabase(
            sessionId,
            completeMessages,
            accumulatedRawJson,
            responseId
          );
        }

        if (!res.writableEnded) {
          logger.info('SSE: Ending response stream.');
          res.end();
        }
      }
    } catch (error) {
      logger.error('SSE: Error streaming from AI service or during parsing:', error);
      if (!res.writableEnded) {
        try {
          send('error', { id: baseMessageId, error: 'Stream interrupted' });
          res.end();
        } catch (e) {
          logger.error('SSE: Error sending error event to client:', e);
        }
      }
    }
    return { responseId, inputTokens, outputTokens, modelUsed };
  }

  private async saveMessagesToDatabase(
    sessionId: string,
    messages: Record<string, { name: string; text: string }>,
    rawJsonString?: string,
    responseId?: string | null
  ): Promise<void> {
    try {
      const allMessagesContent = Object.values(messages)
        .map(msg => `${msg.name}: ${msg.text}`)
        .join('\n\n---\n\n');

      let rawContentObject: object | null = null;
      if (rawJsonString) {
        try {
          rawContentObject = JSON.parse(rawJsonString);
        } catch (parseError) {
          logger.error('Error parsing accumulatedRawJson into an object:', parseError);
          logger.warn(
            'Saving rawJsonString as a fallback string in rawContent due to parse error.'
          );
          rawContentObject = {
            error: 'Failed to parse raw JSON string',
            original: rawJsonString.substring(0, 1000),
            responseId: responseId,
          };
        }
      }

      // Add response ID to raw content for conversation continuity
      if (rawContentObject && responseId) {
        (rawContentObject as any).responseId = responseId;
      } else if (responseId) {
        rawContentObject = { responseId: responseId };
      }

      if (allMessagesContent) {
        await Message.create({
          sessionId,
          role: 'assistant',
          content: allMessagesContent,
          rawContent: rawContentObject,
        });
        logger.info(
          `Saved assistant messages to session ${sessionId}` +
            (responseId ? ` Response ID: ${responseId}` : '')
        );
      } else if (rawContentObject) {
        await Message.create({
          sessionId,
          role: 'assistant',
          content: '[No textual content from AI, see rawContent]',
          rawContent: rawContentObject,
        });
        logger.info(
          `Saved assistant raw content (no text) to session ${sessionId}` +
            (responseId ? ` Response ID: ${responseId}` : '')
        );
      }
    } catch (error) {
      logger.error('Error saving messages to database:', error);
    }
  }
}

export default new SSEStreamService();
