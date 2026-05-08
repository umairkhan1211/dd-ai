import { Request, Response } from 'express';
import { ChatSession, File, Message } from '../models';
import { IChatSession } from '../models/ChatSession';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import logger from '../utils/logger';
import User, { IUser } from '../models/User';
import Operator, { IOperator } from '../models/Operator';
import Cast, { ICastMember } from '../models/Cast';
import Protocol, { IProtocol } from '../models/Protocol';
import aiServiceFactory from '../services/ai/ai.factory';
import systemPromptService from '../services/ai/system-prompt.service';
import sseStreamService from '../services/ai/sse-stream.service';
import { CastService } from '../services/cast.service';
import protocolService from '../services/protocol.service';
import protocolExecutionService, {
  ProtocolExecutionData,
} from '../services/protocolExecution.service';
import { ChatMessage as AIChatMessage } from '../services/ai/ai.interface';
import { BillingService } from '../services/billing.service';
import fetch from 'node-fetch'; // <-- new
import crypto from 'crypto';
import { getDuckSystemInstructions } from '../services/ai/duck-instructions';

import path from 'path';
import fs from 'fs';
import fileService from '../services/file.service';

// Add the temp avatar path declaration
declare module 'express-serve-static-core' {
  interface Request {
    tempAvatarPath?: string;
  }
}

interface UserWithAssociations extends IUser {
  activeOperatorDetail?: IOperator;
}

export const createSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, meta, avatar } = req.body;
    const userId = (req.user as User)?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Create session first
    const session = await ChatSession.create({
      userId,
      title: title || 'New Chat',
      meta: meta || {},
      avatar: avatar || `${process.env.FRONTEND_URL}/src/assets/Avatar/default-session-avatar.png`,
    });

    // Handle BOTH file upload and base64 cases
    let fileToMove: string | undefined;

    if (req.file && fs.existsSync(req.file.path)) {
      fileToMove = req.file.path;
    } else if (req.tempAvatarPath && fs.existsSync(req.tempAvatarPath)) {
      fileToMove = req.tempAvatarPath;
    }

    if (fileToMove) {
      try {
        const sessionId = session.id;

        // Build paths
        const publicDir = path.resolve(__dirname, '../../public');
        const usersDir = path.join(publicDir, 'users');
        const userDir = path.join(usersDir, userId);
        const sessionsDir = path.join(userDir, 'sessions');
        const sessionDir = path.join(sessionsDir, sessionId);

        // Create directories
        if (!fs.existsSync(sessionDir)) {
          fs.mkdirSync(sessionDir, { recursive: true });
        }

        // Move the file
        const filename = path.basename(fileToMove);
        const newFilePath = path.join(sessionDir, filename);

        // Actually move the file
        fs.renameSync(fileToMove, newFilePath);

        // Build the URL
        const relativePath = path.relative(publicDir, newFilePath);
        const normalizedPath = relativePath.replace(/\\/g, '/');
        const urlPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;

        const BACKEND_URL = process.env.BACKEND_URL;
        if (!BACKEND_URL) {
          throw new Error('BACKEND_URL environment variable is required');
        }
        const finalAvatar = `${BACKEND_URL.replace(/\/+$/, '')}${urlPath}`;

        // Update the session
        await session.update({ avatar: finalAvatar });
      } catch (fileError) {
        // Clean up source file on error
        if (fs.existsSync(fileToMove)) {
          fs.unlinkSync(fileToMove);
        }
      }
    }

    res.status(201).json({ sessionId: session.id });
  } catch (error) {
    console.error('💥 FATAL ERROR in createSession:', error);

    // Clean up any temp files on error
    if (req.tempAvatarPath && fs.existsSync(req.tempAvatarPath)) {
      try {
        fs.unlinkSync(req.tempAvatarPath);
      } catch (cleanupError) {
        console.error('❌ Error cleaning up temp file:', cleanupError);
      }
    }

    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('❌ Error cleaning up uploaded file:', cleanupError);
      }
    }

    logger.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
};

export const getSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: sessionId } = req.params;
    const userId = (req.user as User)?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // 1. Fetch the primary session requested
    const mainSession = await ChatSession.findOne({
      where: { id: sessionId, userId },
    });

    if (!mainSession) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // 2. Determine the root ID of the tree this session belongs to
    const actualRootId = mainSession.rootId || mainSession.id;

    // 3. Fetch all sessions in the same tree (branch) belonging to the user
    const branchSessions = await ChatSession.findAll({
      where: {
        [Op.or]: [
          { id: actualRootId }, // The root itself
          { rootId: actualRootId }, // All descendants of that root
        ],
        userId, // Ensure all fetched sessions belong to the user
      },
      order: [['createdAt', 'ASC']], // Order them, e.g., by creation time
    });

    // Convert main session to JSON for the main response part
    const mainSessionJson = mainSession.toJSON() as IChatSession;

    res.json({
      // Core details of the specifically requested session
      id: mainSessionJson.id,
      userId,
      title: mainSessionJson.title,
      meta: mainSessionJson.meta,
      avatar: mainSessionJson.avatar,
      parentId: mainSessionJson.parentId,
      rootId: mainSessionJson.rootId,
      createdAt: mainSessionJson.createdAt,
      updatedAt: mainSessionJson.updatedAt,
      // Flat list of all sessions in its branch (including itself and all descendants)
      branchSessions: branchSessions.map((s: IChatSession) => ({
        id: s.id,
        title: s.title,
        meta: s.meta,
        parentId: s.parentId,
        rootId: s.rootId,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })),
    });
    return;
  } catch (error) {
    logger.error('Error fetching session and its branch:', error);
    res.status(500).json({ error: 'Failed to fetch session and its branch' });
    return;
  }
};

// Update a chat session
export const updateSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: sessionId } = req.params;
    const { title, meta, avatar } = req.body;
    const userId = (req.user as User)?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const session = await ChatSession.findOne({ where: { id: sessionId, userId } });
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Update session data
    if (title !== undefined) {
      session.title = title;
    }

    if (meta !== undefined) {
      session.meta = meta;
    }

    if (avatar !== undefined) {
      session.avatar = avatar;
    }

    await session.save();

    res.json({
      id: session.id,
      title: session.title,
      meta: session.meta,
      avatar: session.avatar,
      parentId: session.parentId,
      rootId: session.rootId,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    });
    return;
  } catch (error) {
    logger.error('Error updating session:', error);
    res.status(500).json({ error: 'Failed to update session' });
    return;
  }
};
export const addMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: sessionId } = req.params;
    const { type, content, castIds, enableWebSearch, files } = req.body;
    const userId = (req.user as User)?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    logger.info(
      `Adding message to session ${sessionId} with content: ${content} and type: ${type}`
    );
    const session = await ChatSession.findOne({ where: { id: sessionId, userId } });
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    // --- Detect protocol activation and execute with new system ---
    let activatedProtocol: IProtocol | null = null;
    let modifiedContent = content;
    let protocolMetadata: Record<string, unknown> = {};
    let userDisplayMessage = content; // What to save as the user message

    // Check if this is a protocol activation
    logger.info(`Checking for protocol activation with content: ${content} and type: ${type}`);
    if (type === 'protocol') {
      try {
        // Parse the protocol execution data from content
        let protocolExecutionData: ProtocolExecutionData;

        try {
          // Try to parse as JSON first (for Level 2 & 3 protocols with data)
          protocolExecutionData = JSON.parse(content);
        } catch {
          // If not JSON, treat as simple protocol name (Level 1)
          protocolExecutionData = {
            protocolId: content.trim(),
            inputs: {},
            modifiers: {},
            metadata: {},
          };
        }
        // Fetch the protocol - handle both ID and name lookups
        // First check if it looks like a UUID (for Level 2 & 3 protocols)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          protocolExecutionData.protocolId
        );

        if (isUUID) {
          // Try by ID first for UUID-like strings
          activatedProtocol = await protocolService.getByIdWithUserAccess(
            protocolExecutionData.protocolId,
            userId
          );
          logger.info('Protocol lookup by ID result:', activatedProtocol);
          if (!activatedProtocol) {
            // Fallback to name lookup
            activatedProtocol = await protocolService.getByName(
              protocolExecutionData.protocolId,
              userId
            );
          }
        } else {
          // For non-UUID strings (like Level 1 protocol names), try by name first
          activatedProtocol = await protocolService.getByName(
            protocolExecutionData.protocolId,
            userId
          );
          logger.info('Protocol lookup by NAME result:', activatedProtocol);
          if (!activatedProtocol) {
            // Fallback to ID lookup (though unlikely to work for non-UUID)
            try {
              activatedProtocol = await protocolService.getByIdWithUserAccess(
                protocolExecutionData.protocolId,
                userId
              );
            } catch (error) {
              // Ignore ID lookup errors for non-UUID strings
              logger.debug(
                `ID lookup failed for non-UUID string: ${protocolExecutionData.protocolId}`
              );
            }
          }
        }

        if (activatedProtocol) {
          // Validate execution data
          protocolExecutionService.validateExecutionData(activatedProtocol, protocolExecutionData);

          // Execute the protocol
          const executionResult = await protocolExecutionService.executeProtocol(
            activatedProtocol,
            protocolExecutionData
          );

          modifiedContent = executionResult.finalPrompt;
          protocolMetadata = executionResult.metadata;

          // Log the execution result for debugging
          logger.info(`Protocol execution result:`, {
            finalPrompt: executionResult.finalPrompt,
            metadata: executionResult.metadata,
            originalContent: content,
          });

          // If finalPrompt is empty, use a default based on protocol
          if (!modifiedContent || modifiedContent.trim() === '') {
            modifiedContent = `Execute the ${activatedProtocol.name} protocol. Original request: ${content}`;
            logger.warn(
              `Protocol ${activatedProtocol.name} returned empty finalPrompt, using default: ${modifiedContent}`
            );
          }

          // Create a clean user display message
          userDisplayMessage = `Executing protocol: ${activatedProtocol.name}`;

          logger.info(
            `Protocol executed: ${activatedProtocol.name} (Level ${activatedProtocol.level})`
          );
        } else {
          logger.warn(`Protocol not found: ${protocolExecutionData.protocolId}`);
          userDisplayMessage = `Protocol not found: ${protocolExecutionData.protocolId}`;
        }
      } catch (error) {
        logger.error(`Error executing protocol:`, error);
        userDisplayMessage = `Error executing protocol: ${error instanceof Error ? error.message : 'Unknown error'}`;
        modifiedContent = userDisplayMessage;
      }
    }

    // Save the user message with clean display text
    const userMessage = await Message.create({
      sessionId,
      role: 'user',
      content: userDisplayMessage,
    });

    //save the files in db
    if (files && files.length > 0) {
      await fileService.bulkCreateFiles(files, userMessage.id);
    }

    // Resolve cast members from castIds or protocol deliveredBy
    const castService = new CastService();
    let castMembers: ICastMember[] = [];
    // If a protocol was executed and specifies a deliveredBy agent, use that instead of castIds
    if (activatedProtocol && activatedProtocol.deliveredBy) {
      logger.info(`Protocol has deliveredBy field: ${activatedProtocol.deliveredBy}`);
      // Try to find the cast member by name
      const protocolCastMember = await castService.getCastMemberByName(
        activatedProtocol.deliveredBy,
        userId
      );

      if (protocolCastMember) {
        castMembers = [protocolCastMember];
        logger.info(`Using protocol-specified cast member: ${activatedProtocol.deliveredBy}`);
      } else {
        logger.warn(
          `Protocol-specified cast member not found: ${activatedProtocol.deliveredBy}, falling back to default cast selection`
        );
      }
    }

    // Fall back to original cast selection if no protocol cast member or not found

    if (castMembers.length === 0) {
      const castIdList: string[] =
        typeof castIds === 'string'
          ? castIds.includes(',')
            ? castIds.split(',')
            : [castIds] // Handle single cast ID as a string
          : Array.isArray(castIds)
            ? castIds
            : [];

      if (castIdList.length > 0) {
        const resolvedCastMembers = (
          await Promise.all(castIdList.map(id => castService.getCastMemberById(id, userId)))
        ).filter((cm): cm is ICastMember => cm !== null);
        castMembers = resolvedCastMembers;
      }
    }

    if (castMembers.length === 0) {
      res.status(400).json({ error: 'No cast member selected' });
      return;
    }

    // Pick primary agent and its instructions
    const primaryAgent = castMembers[0];
    let agentInstructions: string;
    if (primaryAgent.name === 'Duck' && primaryAgent.isSystem) {
      agentInstructions = getDuckSystemInstructions('Disruptive Duck AI');
    } else {
      agentInstructions = `You are ${primaryAgent.name}. ${primaryAgent.description?.trim() || 'You are a helpful assistant.'} Your tone is ${primaryAgent.defaultTone?.trim() || 'professional and friendly'}.`;
    }

    // Determine which AI model to use (protocol takes precedence over cast member)
    let aiModelToUse = null;
    if (activatedProtocol && activatedProtocol.aiModel) {
      aiModelToUse = activatedProtocol.aiModel;
    } else if (primaryAgent.aiModel) {
      aiModelToUse = primaryAgent.aiModel;
    }

    const agentId = primaryAgent.id;
    // const agentInstructions = `You are ${primaryAgent.name}. ${primaryAgent.description?.trim() || 'You are a helpful assistant.'} Your tone is ${primaryAgent.defaultTone?.trim() || 'professional and friendly'}.`;

    // Setup SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Prepare payload for Django API (use modifiedContent after protocol processing)
    const payload = {
      user_id: userId,
      agent_id: agentId,
      agent_instructions: agentInstructions,
      files: files || [],
      agent_name: primaryAgent.name, // Pass agent name from cast member
      agent_role: primaryAgent.functionalRole || 'AI Assistant', // Pass agent role from description
      agent_description: primaryAgent.description || '',
      query: modifiedContent, // Use protocol-modified content
      ai_model_name: aiModelToUse ? aiModelToUse.name : 'gpt-4o-mini', // Fallback model
      ai_model_provider: aiModelToUse ? aiModelToUse.provider : 'openai',
      protocol_metadata: activatedProtocol
        ? {
            protocol_name: activatedProtocol.name,
            protocol_level: activatedProtocol.level,
            protocol_description: activatedProtocol.description,
            protocol_prompt_template: activatedProtocol.promptTemplate,
            protocol_type: activatedProtocol.type,
            protocol_category: activatedProtocol.category,
            protocol_delivered_by: activatedProtocol.deliveredBy,
            protocol_metadata: protocolMetadata,
            original_content: content,
          }
        : null,
    };
    // Log protocol execution details for debugging
    if (activatedProtocol) {
      logger.info(`Sending protocol execution to Python API:`, {
        protocolName: activatedProtocol.name,
        protocolLevel: activatedProtocol.level,
        originalContent: content,
        modifiedContent: modifiedContent.substring(0, 200) + '...', // First 200 chars
        castMember: primaryAgent.name,
        agentName: primaryAgent.name,
        agentRole: primaryAgent.description?.trim() || 'AI Assistant',
        aiModel: aiModelToUse ? aiModelToUse.name : 'none',
        hasMetadata: Object.keys(protocolMetadata).length > 0,
      });
    } else {
      logger.info(`Sending regular chat to Python API:`, {
        castMember: primaryAgent.name,
        agentName: primaryAgent.name,
        agentRole: primaryAgent.description?.trim() || 'AI Assistant',
        aiModel: aiModelToUse ? aiModelToUse.name : 'none',
        content: content.substring(0, 200) + '...', // First 200 chars
      });
    }

    // Call Python API and stream back its SSE
    const pythonUrl = `${process.env.PYTHON_API_URL}/api/chat/`;
    const pythonRes = await fetch(pythonUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': process.env.API_KEY!,
      },
      body: JSON.stringify(payload),
    });

    if (!pythonRes.ok || !pythonRes.body) {
      res.write(
        `data: ${JSON.stringify({ type: 'error', content: 'Upstream service error' })}\n\n`
      );
      res.end();
      return;
    }

    const stream = pythonRes.body;

    // Transform Python API stream to match OpenAI Responses API format that sseStreamService expects
    const { EventEmitter } = require('events');

    const transformedStream = new EventEmitter();
    let responseId = crypto.randomUUID();
    let completeResponse = '';
    let hasStartedJson = false;
    let tokenUsage = {
      total_tokens: 0,
      prompt_tokens: 0,
      completion_tokens: 0,
      agent_name: 'Unknown',
      model_used: aiModelToUse ? aiModelToUse.name : 'gpt-4o-mini', // Use actual AI model or fallback
    };

    // Emit response.created event first
    setTimeout(() => {
      transformedStream.emit('data', {
        type: 'response.created',
        response: { id: responseId },
      });
    }, 0);

    stream.on('data', (chunk: Buffer) => {
      const chunkStr = chunk.toString();

      // Check if this chunk contains metadata (should be at the end)
      if (chunkStr.includes('---METADATA---')) {
        try {
          const metadataMatch = chunkStr.match(/---METADATA---(.*?)---END---/s);
          if (metadataMatch) {
            const metadataStr = metadataMatch[1].trim();
            // Parse the metadata JSON safely
            const metadata = JSON.parse(metadataStr);
            tokenUsage = {
              total_tokens: metadata.total_tokens || 0,
              prompt_tokens: metadata.prompt_tokens || 0,
              completion_tokens: metadata.completion_tokens || 0,
              agent_name: metadata.agent_name || 'Unknown',
              model_used: metadata.model_used || (aiModelToUse ? aiModelToUse.name : 'gpt-4o-mini'),
            };
            logger.info(`Token usage received from Python API: ${JSON.stringify(tokenUsage)}`);

            // Extract content before metadata and add to response
            const contentBeforeMetadata = chunkStr.split('---METADATA---')[0];
            if (contentBeforeMetadata) {
              completeResponse += contentBeforeMetadata;
              if (!hasStartedJson) {
                const escapedAgentName = JSON.stringify(primaryAgent.name).slice(1, -1);
                const jsonStart = `{"messages":[{"name":"${escapedAgentName}","text":"`;
                transformedStream.emit('data', {
                  type: 'response.output_text.delta',
                  delta: jsonStart,
                });
                hasStartedJson = true;
              }

              const escapedChunk = contentBeforeMetadata
                .replace(/\\/g, '\\\\')
                .replace(/"/g, '\\"')
                .replace(/\n/g, '\\n')
                .replace(/\r/g, '\\r')
                .replace(/\t/g, '\\t');
              transformedStream.emit('data', {
                type: 'response.output_text.delta',
                delta: escapedChunk,
              });
            }
            return; // Don't process this chunk further
          }
        } catch (error) {
          logger.error('Error parsing metadata from Python API:', error);
        }
      }

      completeResponse += chunkStr;

      // Send JSON structure start separately if not done yet
      if (!hasStartedJson) {
        // Send the JSON opening structure first - properly escape the agent name
        const escapedAgentName = JSON.stringify(primaryAgent.name).slice(1, -1); // Remove outer quotes
        const jsonStart = `{"messages":[{"name":"${escapedAgentName}","text":"`;
        transformedStream.emit('data', {
          type: 'response.output_text.delta',
          delta: jsonStart,
        });
        hasStartedJson = true;

        // Add a small delay before sending the first chunk to separate JSON structure from content
        setTimeout(() => {
          if (chunkStr.trim()) {
            // Escape any quotes or special characters in the content
            const escapedChunk = chunkStr
              .replace(/\\/g, '\\\\')
              .replace(/"/g, '\\"')
              .replace(/\n/g, '\\n')
              .replace(/\r/g, '\\r')
              .replace(/\t/g, '\\t');
            transformedStream.emit('data', {
              type: 'response.output_text.delta',
              delta: escapedChunk,
            });
          }
        }, 10);
      } else {
        // Continue with escaped chunks to preserve valid JSON
        const escapedChunk = chunkStr
          .replace(/\\/g, '\\\\')
          .replace(/"/g, '\\"')
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t');
        transformedStream.emit('data', {
          type: 'response.output_text.delta',
          delta: escapedChunk,
        });
      }
    });

    stream.on('end', () => {
      // Close the JSON structure
      const jsonEnd = '"}]}';
      transformedStream.emit('data', {
        type: 'response.output_text.delta',
        delta: jsonEnd,
      });

      // Log token usage information
      logger.info(
        `Response completed. Agent: ${tokenUsage.agent_name}, Tokens: ${tokenUsage.total_tokens} (${tokenUsage.prompt_tokens} input + ${tokenUsage.completion_tokens} output), Model: ${tokenUsage.model_used}`
      );

      // Emit completion events
      transformedStream.emit('data', {
        type: 'response.output_text.done',
      });

      transformedStream.emit('data', {
        type: 'response.completed',
      });

      transformedStream.emit('end');
    });

    stream.on('error', (err: Error) => {
      console.error('Upstream stream error:', err);
      transformedStream.emit('data', {
        type: 'error',
        error: err.message,
      });
      transformedStream.emit('end');
    });

    // Create an async iterator for the transformed stream to match OpenAI API format
    const asyncIterableStream = {
      [Symbol.asyncIterator]: async function* () {
        const events: any[] = [];
        let ended = false;

        transformedStream.on('data', (event: any) => {
          events.push(event);
        });

        transformedStream.on('end', () => {
          ended = true;
        });

        while (!ended || events.length > 0) {
          if (events.length > 0) {
            yield events.shift();
          } else {
            // Wait a bit for more events
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        }
      },
    };

    // Use the transformed stream with sseStreamService
    const finalResponseId = await sseStreamService.pipeOpenAIToSSE(
      res,
      asyncIterableStream,
      sessionId
    );

    // Store token usage information in the database if we have it
    if (tokenUsage.total_tokens > 0) {
      try {
        // Update the latest assistant message with token information
        const latestMessage = await Message.findOne({
          where: { sessionId, role: 'assistant' },
          order: [['createdAt', 'DESC']],
        });

        if (latestMessage) {
          const updatedRawContent = {
            ...((latestMessage.rawContent as any) || {}),
            tokenUsage: tokenUsage,
            responseId: finalResponseId,
          };

          await latestMessage.update({
            tokenCount: tokenUsage.total_tokens,
            rawContent: updatedRawContent,
          });

          logger.info(
            `Updated message with token usage: ${tokenUsage.total_tokens} tokens for agent: ${tokenUsage.agent_name}`
          );
        }
      } catch (error) {
        logger.error('Error storing token usage:', error);
      }
    }

    // --- Billing: Log and Deduct after response is complete ---
    // Use the model determined at the AI service level, or fallback to frontend request if stream doesn't override

    await BillingService.logCompletedAIUsageAndDeduct(
      userId,
      sessionId,
      tokenUsage.prompt_tokens, // inputTokens: Set to 0 as we're not calculating upfront in the controller
      tokenUsage.completion_tokens, // outputTokens: Using totalTokens from stream for output
      type, // Use the determined interaction type
      tokenUsage.model_used,
      activatedProtocol?.level
    );

    logger.info(`Completed streaming with response ID: ${finalResponseId}`);
  } catch (error) {
    logger.error('Error in addMessage:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
};

export const addMessage2 = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: sessionId } = req.params;
    const { type, content, castIds, enableWebSearch } = req.body;
    const userId = (req.user as User)?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const session = await ChatSession.findOne({ where: { id: sessionId, userId } });
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // --- Detect protocol activation and execute with new system ---
    let activatedProtocol: IProtocol | null = null;
    let modifiedContent = content;
    let protocolMetadata: Record<string, unknown> = {};
    let userDisplayMessage = content;

    // --- Determine interactionType early ---
    let determinedInteractionType: 'chat' | 'image_gen' | 'code_gen' | 'template_ai_fill' | string =
      'chat'; // Default to 'chat'

    if (type === 'protocol') {
      try {
        let protocolExecutionData: ProtocolExecutionData;
        try {
          protocolExecutionData = JSON.parse(content);
        } catch {
          protocolExecutionData = {
            protocolId: content.trim(),
            inputs: {},
            modifiers: {},
            metadata: {},
          };
        }

        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          protocolExecutionData.protocolId
        );

        if (isUUID) {
          activatedProtocol = await protocolService.getByIdWithUserAccess(
            protocolExecutionData.protocolId,
            userId
          );
          if (!activatedProtocol) {
            activatedProtocol = await protocolService.getByName(
              protocolExecutionData.protocolId,
              userId
            );
          }
        } else {
          activatedProtocol = await protocolService.getByName(
            protocolExecutionData.protocolId,
            userId
          );
          if (!activatedProtocol) {
            try {
              activatedProtocol = await protocolService.getByIdWithUserAccess(
                protocolExecutionData.protocolId,
                userId
              );
            } catch (error) {
              logger.debug(
                `ID lookup failed for non-UUID string: ${protocolExecutionData.protocolId}`
              );
            }
          }
        }

        if (activatedProtocol) {
          protocolExecutionService.validateExecutionData(activatedProtocol, protocolExecutionData);

          const executionResult = await protocolExecutionService.executeProtocol(
            activatedProtocol,
            protocolExecutionData
          );

          modifiedContent = executionResult.finalPrompt;
          protocolMetadata = executionResult.metadata;
          userDisplayMessage = `Executing protocol: ${activatedProtocol.name}`;

          logger.info(
            `Protocol executed: ${activatedProtocol.name} (Level ${activatedProtocol.level})`
          );

          // Assign interaction type based on protocol
          // Adjust this logic to match the actual possible values of activatedProtocol.type
          // For example, if you want to use 'compositional' for code_gen, 'semi-dynamic' for image_gen, etc.
          if (activatedProtocol.type === 'compositional') {
            determinedInteractionType = 'code_gen';
          } else if (activatedProtocol.type === 'semi-dynamic') {
            determinedInteractionType = 'image_gen';
          } else {
            determinedInteractionType = 'template_ai_fill'; // Default for protocols
          }
        } else {
          logger.warn(`Protocol not found: ${protocolExecutionData.protocolId}`);
          userDisplayMessage = `Protocol not found: ${protocolExecutionData.protocolId}`;
          // If protocol not found, revert to chat or generic AI type
          determinedInteractionType = 'chat';
        }
      } catch (error) {
        logger.error(`Error executing protocol:`, error);
        userDisplayMessage = `Error executing protocol: ${error instanceof Error ? error.message : 'Unknown error'}`;
        modifiedContent = userDisplayMessage;
        determinedInteractionType = 'chat'; // Revert on error
      }
    } else {
      determinedInteractionType = 'chat'; // Explicitly set if not a protocol
    }

    await Message.create({
      sessionId,
      role: 'user',
      content: userDisplayMessage,
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let messagesForAIContext: AIChatMessage[] = [];
    const messagePromises = [];

    messagePromises.push(
      Message.findAll({
        where: { sessionId: session.id },
        order: [['createdAt', 'DESC']],
        limit: 6,
      })
    );

    if (session.parentId) {
      messagePromises.push(
        Message.findAll({
          where: { sessionId: session.parentId },
          order: [['createdAt', 'DESC']],
          limit: 6,
        })
      );
    }

    const actualRootId = session.rootId || session.id;
    if (actualRootId !== session.id && actualRootId !== session.parentId) {
      messagePromises.push(
        Message.findAll({
          where: { sessionId: actualRootId },
          order: [['createdAt', 'DESC']],
          limit: 6,
        })
      );
    }

    const messageSets = await Promise.all(messagePromises);

    const allFetchedMessages: Message[] = [];
    messageSets.forEach(set => {
      allFetchedMessages.push(...set.reverse());
    });

    const uniqueMessagesMap = new Map<string, Message>();
    allFetchedMessages.forEach(msg => {
      if (!uniqueMessagesMap.has(msg.id)) {
        uniqueMessagesMap.set(msg.id, msg);
      }
    });

    const sortedUniqueMessages = Array.from(uniqueMessagesMap.values()).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    messagesForAIContext = sortedUniqueMessages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    const user = (await User.findByPk(userId, {
      include: [
        {
          model: Operator,
          as: 'activeOperatorDetail',
        },
      ],
    })) as unknown as UserWithAssociations;

    let operatorProfile = {
      assistant_name: 'Assistant',
      profile: 'You are a helpful assistant',
      guidelines: ['You are a helpful assistant'],
      context: 'You are a helpful assistant',
    };

    if (user?.activeOperatorDetail) {
      operatorProfile = user.activeOperatorDetail.profile as any;
    }

    const castIdsSplitted = castIds ? castIds.split(',') : [];

    let castMembers: ICastMember[] = [];

    if (activatedProtocol && activatedProtocol.deliveredBy) {
      logger.info(`Protocol has deliveredBy field: ${activatedProtocol.deliveredBy}`);
      const castService = new CastService();
      const protocolCastMember = await castService.getCastMemberByName(
        activatedProtocol.deliveredBy,
        userId
      );
      if (protocolCastMember) {
        castMembers = [protocolCastMember];
        logger.info(`Using protocol-specified cast member: ${activatedProtocol.deliveredBy}`);
      } else {
        logger.warn(
          `Protocol-specified cast member not found: ${activatedProtocol.deliveredBy}, falling back to default cast selection`
        );
        if (castIdsSplitted.length > 0) {
          const castPromises = castIdsSplitted.map((castId: string) =>
            castService.getCastMemberById(castId, userId)
          );

          const resolvedCastMembers = await Promise.all(castPromises);
          castMembers = resolvedCastMembers.filter(member => member !== null) as ICastMember[];
        }
      }
    } else {
      logger.info(
        `No protocol deliveredBy field. activatedProtocol: ${!!activatedProtocol}, deliveredBy: ${activatedProtocol?.deliveredBy}`
      );
      if (castIdsSplitted.length > 0) {
        const castService = new CastService();
        const castPromises = castIdsSplitted.map((castId: string) =>
          castService.getCastMemberById(castId, userId)
        );

        const resolvedCastMembers = await Promise.all(castPromises);
        castMembers = resolvedCastMembers.filter(member => member !== null) as ICastMember[];
      }
    }

    const aiService = aiServiceFactory.getService();

    // --- Determine modelUsed from AI Service instance ---
    // TODO: Implement comprehensive estimation and upfront check here.
    // We need to get what model is used  here so we can add in billing details column
    // At this point, you'd estimate tokens, call BillingService.canGenerateAI,
    // and potentially deduct estimated ducks before the AI call.
    // Example:
    // const estimatedInputTokens = await estimateTokens(modifiedContent, messagesForAIContext, systemPrompt, determinedModelUsed);
    // const canGenerateResult = await BillingService.canGenerateAI(userId, estimatedInputTokens, determinedInteractionType, determinedModelUsed);
    // if (!canGenerateResult.allowed) { /* return 403 */ }

    try {
      const systemPrompt = systemPromptService.generateSystemPrompt('system.njk', {
        operatorProfile: operatorProfile,
        castMembers: castMembers,
      });

      let previousResponseId: string | null = null;
      const lastAssistantMessage = await Message.findOne({
        where: {
          sessionId,
          role: 'assistant',
          rawContent: { [Op.ne]: null },
        },
        order: [['createdAt', 'DESC']],
      });

      if (lastAssistantMessage && lastAssistantMessage.rawContent) {
        try {
          const rawContent = lastAssistantMessage.rawContent as any;
          if (rawContent.responseId) {
            previousResponseId = rawContent.responseId;
            logger.info(
              `Using previous response ID for conversation continuity: ${previousResponseId}`
            );
          } else if (rawContent.id) {
            previousResponseId = rawContent.id;
            logger.info(
              `Using fallback response ID for conversation continuity: ${previousResponseId}`
            );
          }
        } catch (error) {
          logger.warn('Failed to extract response ID from last message:', error);
        }
      }

      console.log('SENDING PROMPT', modifiedContent, castMembers);
      console.log('SENDING MESSAGES', {
        prompt: modifiedContent,
        messages: messagesForAIContext,
        systemPrompt,
        options: {
          previousResponseId: previousResponseId || undefined, // Pass the response ID for conversation continuity
          enableWebSearch: enableWebSearch, // Pass the web search toggle state
          jsonSchema: {
            type: 'object',
            properties: {
              messages: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      description: 'The name of the cast member speaking',
                    },
                    text: {
                      type: 'string',
                      description: 'The dialogue or message content',
                    },
                  },
                  additionalProperties: false,
                  required: ['name', 'text'],
                },
              },
            },
            additionalProperties: false,
            required: ['messages'],
          },
        },
      });
      const { stream } = await aiService.streamContent({
        prompt: modifiedContent,
        messages: messagesForAIContext,
        systemPrompt,
        options: {
          previousResponseId: previousResponseId || undefined,
          enableWebSearch: enableWebSearch,
          jsonSchema: {
            type: 'object',
            properties: {
              messages: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      description: 'The name of the cast member speaking',
                    },
                    text: {
                      type: 'string',
                      description: 'The dialogue or message content',
                    },
                  },
                  additionalProperties: false,
                  required: ['name', 'text'],
                },
              },
            },
            additionalProperties: false,
            required: ['messages'],
          },
        },
      });

      // sseStreamService.pipeOpenAIToSSE should return responseId and totalTokens, and potentially the actual model used by AI
      const {
        responseId,
        inputTokens,
        outputTokens,
        modelUsed: actualModelUsedFromStream,
      } = await sseStreamService.pipeOpenAIToSSE(res, stream, sessionId);

      // --- Billing: Log and Deduct after response is complete ---
      // Use the model determined at the AI service level, or fallback to frontend request if stream doesn't override
      const finalModelUsed = actualModelUsedFromStream || '';

      await BillingService.logCompletedAIUsageAndDeduct(
        userId,
        sessionId,
        inputTokens, // inputTokens: Set to 0 as we're not calculating upfront in the controller
        outputTokens, // outputTokens: Using totalTokens from stream for output
        determinedInteractionType, // Use the determined interaction type
        finalModelUsed
      );

      logger.info(`Completed streaming with response ID: ${responseId}`);
    } catch (error) {
      logger.error('Error streaming response:', error);
      res.write(
        `data: ${JSON.stringify({ type: 'error', content: 'Failed to generate response' })}\n\n`
      );
      res.end();
    }
  } catch (error) {
    logger.error('Error adding message:', error);
    res.status(500).json({ error: 'Failed to process message' });
    return;
  }
};

export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: sessionId } = req.params;
    const userId = (req.user as User)?.id;
    const cursor = req.query.cursor as string;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify the session exists and belongs to the user
    const session = await ChatSession.findOne({ where: { id: sessionId, userId } });
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Query to get messages with pagination
    const queryOptions: any = {
      include: [
        {
          model: File,
          as: 'files',
          required: false, // LEFT JOIN
          attributes: ['id', 'originalName', 'uniqueName', 'messageId', 'createdAt'],
        },
      ],
      where: { sessionId },
      order: [['createdAt', 'DESC']],
      limit,
    };

    if (cursor) {
      queryOptions.where.createdAt = { [Op.lt]: new Date(cursor) };
    }

    const messages = await Message.findAll(queryOptions);
    // Include the next cursor in the response
    const nextCursor =
      messages.length === limit ? messages[messages.length - 1].createdAt.toISOString() : null;
    res.json({
      messages: messages.map(m => {
        const messageObj = m.toJSON();
        return {
          id: messageObj.id,
          role: messageObj.role,
          content: messageObj.content,
          rawContent: messageObj.rawContent,
          createdAt: messageObj.createdAt,
          files: messageObj.files || [], // Use the files from the JSON object
        };
      }),
      nextCursor,
    });
    return;
  } catch (error) {
    logger.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
    return;
  }
};

export const forkSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: sessionId } = req.params;
    const { title } = req.body;
    const userId = (req.user as User)?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const originalSession = await ChatSession.findOne({ where: { id: sessionId, userId } });
    if (!originalSession) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const newSession = await ChatSession.create({
      userId,
      title: title || `Fork of ${originalSession.title}`,
      meta: originalSession.meta,
      parentId: sessionId,
      rootId: originalSession.rootId || sessionId,
    });

    // Always copy the last 6 messages
    const messagesToCopy = await Message.findAll({
      where: { sessionId }, // Messages from the original session
      order: [['createdAt', 'DESC']],
      limit: 6,
    });

    if (messagesToCopy.length > 0) {
      // Messages are fetched in DESC order, reverse them to insert in ASC order
      await Promise.all(
        messagesToCopy.reverse().map(msg =>
          Message.create({
            sessionId: newSession.id, // Associate with the new session
            role: msg.role,
            content: msg.content,
            rawContent: msg.rawContent, // Also copy rawContent if available
            tokenCount: msg.tokenCount,
            // Ensure createdAt is not copied directly to reflect new message entries for the fork
            // If you need to preserve original creation times for copied messages, that's a different logic.
            // For now, they will get new timestamps as they are created for the new session.
          })
        )
      );
    }

    res.status(201).json({ sessionId: newSession.id });
    return;
  } catch (error) {
    logger.error('Error forking session:', error);
    res.status(500).json({ error: 'Failed to fork session' });
    return;
  }
};

export const listSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as User)?.id;
    const includeTree = req.query.includeTree === 'true';

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    let sessions;
    if (includeTree) {
      sessions = await ChatSession.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
      });
    } else {
      sessions = await ChatSession.findAll({
        where: { userId, parentId: null },
        order: [['createdAt', 'DESC']],
      });
    }

    res.json({
      sessions: sessions.map(s => ({
        id: s.id,
        title: s.title,
        meta: s.meta,
        avatar: s.avatar,
        parentId: s.parentId,
        rootId: s.rootId,
        createdAt: s.createdAt as Date,
      })),
    });
    return;
  } catch (error) {
    logger.error('Error listing sessions:', error);
    res.status(500).json({ error: 'Failed to list sessions' });
    return;
  }
};

// Delete a chat session
export const deleteSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = req.params.sessionId || req.params.id;
    const userId = (req.user as User)?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!sessionId) {
      res.status(400).json({ error: 'Session ID is required' });
      return;
    }
    // Find the session first to ensure it exists and belongs to user
    const session = await ChatSession.findOne({
      where: {
        id: sessionId,
        userId: userId,
      },
    });

    if (!session) {
      console.log('Session not found or not owned by user');
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Clean up session files BEFORE deleting from database
    await cleanupSessionFiles(userId, sessionId);
    // Delete the session from database
    await session.destroy();

    res.status(200).json({
      message: 'Session deleted successfully',
      sessionId: sessionId,
    });
  } catch (error) {
    logger.error('Error deleting session:', error);
    res.status(500).json({
      error: 'Failed to delete session',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

const cleanupSessionFiles = async (userId: string, sessionId: string): Promise<void> => {
  try {
    const publicDir = path.resolve(__dirname, '../../public');
    const sessionDir = path.join(publicDir, 'users', userId, 'sessions', sessionId);

    if (fs.existsSync(sessionDir)) {
      // Get list of files before deletion
      const files = fs.readdirSync(sessionDir);

      // Remove all files in the directory
      files.forEach(file => {
        const filePath = path.join(sessionDir, file);
        fs.unlinkSync(filePath);
      });

      // Remove the directory itself
      fs.rmdirSync(sessionDir);

      // Check if sessions directory is empty and remove it
      const sessionsDir = path.join(publicDir, 'users', userId, 'sessions');
      if (fs.existsSync(sessionsDir)) {
        const remainingSessions = fs.readdirSync(sessionsDir);
        if (remainingSessions.length === 0) {
          fs.rmdirSync(sessionsDir);
          console.log('   - Deleted empty sessions directory');
        }
      }
    }
  } catch (error) {
    console.error('Error cleaning up session files:', error);
    // Don't throw error - file cleanup failure shouldn't prevent session deletion
  }
};
