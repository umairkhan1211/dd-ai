import { useState, ChangeEvent, FormEvent, useRef, useEffect, useMemo, useCallback, forwardRef, useImperativeHandle, useLayoutEffect, } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, AlertTriangle, GitFork, Search, Plus, Upload, ChevronDown, Check, File, X, Image } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "../ui/input";
import { useTasks } from "@/contexts/TaskContext";
import { Badge } from "../ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { streamChat } from "@/services/chatStreamService";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useCastMembers } from "@/hooks/use-cast-members";
import { CastMemberType } from "@/components/deviation/CastMemberCard";
import { useSessionQuery, useUpdateSessionMeta, useForkSession, } from "@/hooks/use-session";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
// import Ailoader from "../ui/Ailoader";
import S3MultipartUploadService from "@/services/multipartUploader";
import { toast } from "@/hooks/use-toast";

import fileIcon from "../../assets/FilesIcons/file.png";
import imageIcon from "../../assets/FilesIcons/image.png";
import pdfIcon from "../../assets/FilesIcons/pdf.png";
import wordIcon from "../../assets/FilesIcons/word.png";
import excelIcon from "../../assets/FilesIcons/excel.png";
import powerPointIcon from "../../assets/FilesIcons/powerpoint.png";

// Yeh props aapke parent component se aayenge
const ChatHeader = ({
  isMobile,
  handleInitiateFork,
  forkSessionMutation,
  castMembers,
  enabledCastId,
  handleToggleCastEnabled,
  onSelectedCastChange,

}) => {
  const selectedCastMember =
    castMembers?.find((cast) => cast.id === enabledCastId) || null;


  useEffect(() => {
    if (onSelectedCastChange) {
      onSelectedCastChange(selectedCastMember);
    }
  }, [selectedCastMember]);

  return (
    <div
      className={`sticky rounded-t-3xl top-0 z-10 w-full bg-transparent ${isMobile ? "p-2 pb-1" : "px-4 py-3"
        }`}
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="
        flex flex-col sm:flex-row 
        items-stretch sm:items-center justify-between 
        gap-3 sm:gap-4 
        w-full
      "
      >
        {/*  Left Side — Cast Member Dropdown */}
        {castMembers && castMembers.length > 0 && selectedCastMember ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="
        glassy-pill flex items-center justify-between 
        w-full sm:w-auto 
        min-w-[180px] sm:min-w-[200px] md:min-w-[240px] lg:min-w-[280px] 
        max-w-full sm:max-w-[60vw] md:max-w-[65%]
        px-3 py-2
        transition-all duration-200
        overflow-hidden
      "  >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    {selectedCastMember.avatar ? (
                      <img
                        src={
                          typeof selectedCastMember.avatar === 'string'
                            ? selectedCastMember.avatar
                            : URL.createObjectURL(selectedCastMember.avatar)
                        }
                        alt={selectedCastMember.name}
                        className="h-full w-full object-cover rounded-full"
                      />
                    ) : (
                      <AvatarFallback className="text-sm font-ubuntu bg-gray-600 text-white">
                        {selectedCastMember.name[0]?.toUpperCase() || 'C'}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div className="text-left truncate min-w-0">
                    <p className="text-sm md:text-base font-semibold font-ubuntu text-white truncate">
                      {selectedCastMember.name}
                    </p>
                    <p className="text-xs md:text-sm text-gray-300 truncate">
                      {selectedCastMember.functionalRole || 'GPT-4o'}
                    </p>
                  </div>
                </div>

                <div className="ml-2 sm:ml-3 md:ml-4 pl-2 sm:pl-3 border-l border-white/20 flex-shrink-0">
                  <ChevronDown className="h-4 w-4 md:h-5 md:w-5 text-gray-300" />
                </div>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="glassy-dropdown-content w-[var(--radix-dropdown-menu-trigger-width)] max-w-[100vw] "
              align="start"
            >
              {castMembers.map((cast) => (
                <DropdownMenuItem
                  key={cast.id}
                  className="glassy-dropdown-item flex items-center gap-3"
                  onSelect={() => handleToggleCastEnabled(cast.id)}
                >
                  <Avatar className="h-7 w-7 flex-shrink-0">
                    {cast.avatar ? (
                      <img
                        src={
                          typeof cast.avatar === 'string'
                            ? cast.avatar
                            : URL.createObjectURL(cast.avatar)
                        }
                        alt={cast.name}
                        className="h-full w-full object-cover rounded-full"
                      />
                    ) : (
                      <AvatarFallback className="text-xs bg-gray-500 text-white">
                        {cast.name[0]?.toUpperCase() || 'C'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="flex-grow text-sm truncate">{cast.name}</span>
                  {enabledCastId === cast.id && (
                    <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

        ) : (
          <div className="text-xs sm:text-sm text-gray-400 font-ubuntu text-center w-full sm:w-auto">
            Please create a cast member.
          </div>
        )}

        {/* Right Side — New Task Button */}
        <button
          onClick={handleInitiateFork}
          disabled={forkSessionMutation.isPending}
          className="
          glassy-pill font-ubuntu flex items-center justify-center
          w-full sm:w-auto sm:flex-shrink-0
          py-2 px-4 md:px-6 text-sm md:text-base
          transition-all duration-200 
          hover:bg-white/20 disabled:opacity-50
        "
        >
          {forkSessionMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <GitFork className="h-4 w-4 mr-2" />
          )}
          <span className="truncate">New Task</span>
        </button>
      </motion.div>
    </div>
  );

};


// Track message mappings from base ID to streaming message IDs
interface MessageMapping {
  baseId: string;
  streamingIds: string[];
}

interface CastMember {
  id: string;
  name: string;
  role?: string;
  avatarUrl?: string;
  [key: string]: any;
}


export interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "agent";
  agentId?: string;
  speakerName?: string;
  timestamp: Date;
  taskId?: string;
  isStreaming?: boolean;
  isTemporary?: boolean;
  files?: {
    id?: string;
    originalName: string;
    uniqueName: string;
    createdAt?: string;
  }[];
}

interface ChatInterfaceProps {
  projectId: string;
  onSendMessage: (
    content: string,
    enabledCastMemberIds: string[],
    taskTitle?: string
  ) => void;
  showTaskInput?: boolean;
  onCloseTaskInput?: () => void;
  hideTitleOnMobile?: boolean;
}

// Define the type for the exposed methods
export interface ChatInterfaceHandle {
  handleProtocolActivation: (protocolName: string) => void;
}

// Use forwardRef to allow parent to get a ref to this component
export const ChatInterface = forwardRef<
  ChatInterfaceHandle,
  ChatInterfaceProps
>(
  (
    {
      projectId,
      onSendMessage,
      showTaskInput = false,
      onCloseTaskInput,
      hideTitleOnMobile = false,

    },
    ref
  ) => {
    const [prompt, setPrompt] = useState("");
    const [taskTitle, setTaskTitle] = useState("");
    const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
    const [enableWebSearch, setEnableWebSearch] = useState(false);
    const [isLoadingPrevious, setIsLoadingPrevious] = useState(false);
    const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);
    const [isProtocolExecuting, setIsProtocolExecuting] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const scrollPositionRef = useRef<number>(0);
    const { activeTaskId, addMessageToTask, getActiveTask } = useTasks();
    const isMobile = useIsMobile();
    const activeStreamingConnections = useRef<AbortController[]>([]);
    const messageIdMappings = useRef<Map<string, MessageMapping>>(new Map());
    const [isRefreshing, setIsRefreshing] = useState(false);
    const {
      data: historicalData,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
      isLoading: isLoadingHistorical,
      isError: isErrorHistorical,
      refetch: refetchMessages,
      isRefetching: isRefetchingMessages,
    } = useChatMessages(projectId);

    const { useCastMembersQuery } = useCastMembers();
    const {
      data: castMembers,
      isLoading: isLoadingCast,
      isError: isErrorCast,
      error: errorCast,
    } = useCastMembersQuery();
    const {
      data: sessionData,
      isLoading: isLoadingSession,
      refetch: refetchSession,
    } = useSessionQuery(projectId);
    const updateSessionMetaMutation = useUpdateSessionMeta(projectId);
    const forkSessionMutation = useForkSession();
    const [isForkingDialogOpen, setIsForkingDialogOpen] = useState(false);
    const [forkTaskTitle, setForkTaskTitle] = useState("");
    const navigate = useNavigate();
    const [enabledCastId, setEnabledCastId] = useState<string | null>(null);
    const [hasCastMembers, setHasCastMembers] = useState(false);
    const initialScrollDone = useRef(false); // Ref to track initial scroll
    const userScrolledUp = useRef(false);
    const scrollThreshold = 100;
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadedFilesData, setUploadedFilesData] = useState<{ uniqueName: string; originalName: string }[]>([]);
    const [uploadProgress, setUploadProgress] = useState<number[]>([]); // one progress per file
    const maxFiles = 3;

    const [selectedCastMember, setSelectedCastMember] = useState<CastMember | null>(null);

    const handleSelectedCastMemberChange = (member: CastMember | null): void => {
      setSelectedCastMember(member);
    };


    useEffect(() => {
      const scrollViewport = scrollAreaRef.current?.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLElement | null;

      if (!scrollViewport) return;

      const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = scrollViewport;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

        // User is near bottom (within threshold) or scrolled to bottom
        userScrolledUp.current = distanceFromBottom > scrollThreshold;
      };

      scrollViewport.addEventListener("scroll", handleScroll);
      return () => scrollViewport.removeEventListener("scroll", handleScroll);
    }, []);


    // Create a function to handle cast member selection that updates both state and backend
    const selectCastMember = useCallback(
      async (castId: string) => {
        setEnabledCastId(castId);
        try {
          await updateSessionMetaMutation.mutateAsync({
            enabledCastIds: [castId], // Store as single-item array
          });
        } catch (e) {
          console.error("Failed to update session meta:", e);
          // Revert state on error
          setEnabledCastId((prev) => prev);
        }
      },
      [updateSessionMetaMutation]
    );



    useEffect(() => {
      if (
        sessionData?.meta?.enabledCastIds &&
        sessionData.meta.enabledCastIds.length > 0
      ) {
        // Take the first enabled ID
        setEnabledCastId(sessionData.meta.enabledCastIds[0]);
      }
    }, [sessionData]);

    // Automatically select first cast member if none selected
    useEffect(() => {
      const isSessionLoaded = !isLoadingSession && sessionData !== undefined;
      const sessionEnabledIds = sessionData?.meta?.enabledCastIds || [];
      // Check if the currently enabled ID (if any) exists in the current castMembers list
      const isCurrentSelectionValid =
        enabledCastId !== null &&
        castMembers?.some((member) => member.id === enabledCastId);

      // Determine if auto-selection is needed
      const needsAutoSelection =
        castMembers &&
        castMembers.length > 0 &&
        (enabledCastId === null || !isCurrentSelectionValid); // Trigger if nothing selected OR selection is stale

      // Check if session data also indicates no *valid* selection for current members
      // This prevents overriding a valid session selection that just hasn't loaded yet
      // or is for a member not yet loaded (though the latter is less likely if castMembers is fully loaded)
      const hasNoValidSessionSelectionForCurrentMembers =
        sessionEnabledIds.length === 0 ||
        !castMembers?.some((member) => sessionEnabledIds.includes(member.id));

      if (
        needsAutoSelection &&
        isSessionLoaded &&
        hasNoValidSessionSelectionForCurrentMembers
      ) {
        selectCastMember(castMembers[0].id);
      }

      // Update hasCastMembers flag
      if (castMembers) {
        setHasCastMembers(castMembers?.length > 0);
      }
    }, [
      castMembers,
      enabledCastId,
      selectCastMember,
      sessionData,
      isLoadingSession,
    ]);

    const isLoading = useMemo(() => {
      return (
        isLoadingCast ||
        isLoadingSession ||
        isLoadingHistorical ||
        isRefreshing ||
        isRefetchingMessages
      );
    }, [
      isLoadingCast,
      isLoadingSession,
      isLoadingHistorical,
      isRefreshing,
      isRefetchingMessages,
    ]);

    const allMessages = useMemo(() => {
      if (isRefreshing) return [];
      const historicalMessages =
        historicalData?.pages.flatMap((page) => page.messages) || [];

      // Create a map of historical messages for quick lookup by ID
      const historicalMap = new Map();
      // Also create a map for content-based lookup (for non-ID matches)
      // Key: `${sender}-${content.substring(0, 100)}-${Math.floor(timestamp.getTime() / 10000)}` (approx time in 10s blocks)
      // Value: the historical message object
      const historicalContentMap = new Map();

      historicalMessages.forEach((msg) => {
        historicalMap.set(msg.id, msg);
        // Use a more robust key for content-based comparison
        // Include sender, a snippet of content, and a coarse timestamp to reduce collisions
        // Adjust the substring length and time tolerance as needed
        const contentKey = `${msg.sender}-${msg.content.substring(
          0,
          100
        )}-${Math.floor(msg.timestamp.getTime() / 10000)}`;
        historicalContentMap.set(contentKey, msg);
      });

      // Filter out live messages that exist in historical data (by ID or content)
      const uniqueLiveMessages = liveMessages.filter((liveMsg) => {
        // 1. Direct ID match (existing logic, most reliable)
        if (historicalMap.has(liveMsg.id)) {
          return false;
        }

        // 2. Content-based match for non-temporary agent messages
        // This catches cases where IDs differ between frontend temp and backend final message
        if (
          !liveMsg.isTemporary &&
          liveMsg.sender === "agent" &&
          liveMsg.content.trim() !== ""
        ) {
          const contentKey = `${liveMsg.sender}-${liveMsg.content.substring(
            0,
            100
          )}-${Math.floor(liveMsg.timestamp.getTime() / 10000)}`;
          if (historicalContentMap.has(contentKey)) {
            const historicalMsg = historicalContentMap.get(contentKey);
            // Optional: Add a more stringent check, e.g., compare full content or check if liveMsg.timestamp is close to or before historicalMsg.timestamp
            // For now, finding a match by sender, content snippet, and approximate time is usually sufficient.

            return false; // Considered duplicate based on content/time
          }
        }

        // If no match found by ID or content/time, keep the live message
        return true;
      });

      return [...historicalMessages, ...uniqueLiveMessages].sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      );
    }, [historicalData, liveMessages, isRefreshing]);

    useLayoutEffect(() => {
      const scrollViewport = scrollAreaRef.current?.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLElement | null;

      if (scrollViewport) {
        if (isLoadingPrevious || isFetchingNextPage) {
          setTimeout(() => {
            scrollViewport.scrollTop = scrollPositionRef.current;
          }, 50);
        } else if (!initialScrollDone.current && allMessages.length > 0) {
          // Initial load: scroll to bottom
          scrollViewport.scrollTo({
            top: scrollViewport.scrollHeight,
            behavior: "smooth",
          });
          initialScrollDone.current = true;
          userScrolledUp.current = false; // Reset after initial scroll
        } else if (initialScrollDone.current && allMessages.length > 0) {
          const lastMessage = allMessages[allMessages.length - 1];

          // Only auto-scroll if:
          // 1. It's a new message AND
          // 2. User hasn't scrolled up
          if (
            lastMessage &&
            (lastMessage.sender === "user" || lastMessage.sender === "agent") &&
            !userScrolledUp.current
          ) {
            scrollViewport.scrollTo({
              top: scrollViewport.scrollHeight,
              behavior: "smooth",
            });
          }
        }
      }
    }, [allMessages, liveMessages, isLoadingPrevious, isFetchingNextPage]);

    useEffect(() => {
      if (scrollAreaRef.current) {
        const el = scrollAreaRef.current;
        el.scrollTop = el.scrollHeight;
        el.scrollTo({
          top: el.scrollHeight,
          behavior: "smooth",
        });
      }
    }, [allMessages, isAwaitingResponse]);

    useEffect(() => {
      return () => {
        activeStreamingConnections.current.forEach((controller) => {
          controller.abort();
        });
      };
    }, []);

    const handleLoadPrevious = () => {
      const scrollViewport = scrollAreaRef.current?.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLElement | null;

      if (scrollViewport) {
        scrollPositionRef.current = scrollViewport.scrollTop;
      }

      setIsLoadingPrevious(true);
      fetchNextPage().finally(() => {
        setIsLoadingPrevious(false);
        if (scrollViewport) {
          setTimeout(() => {
            scrollViewport.scrollTop = scrollPositionRef.current;
          }, 100); // Increased delay to ensure DOM updates
        }
      });
    };

    const handleToggleCastEnabled = async (castId: string) => {
      // If clicking the already selected member, do nothing
      if (castId === enabledCastId) return;

      // Otherwise select the new member and update backend
      selectCastMember(castId);
    };

    const sendMessageToServer = useCallback(
      async (messageContent: string, messageType: "message" | "protocol", filesData: { uniqueName: string; originalName: string }[] | null = null) => {

        if (!enabledCastId) {
          console.warn("No cast member selected. Message not sent.");
          return;
        }

        const handleStreamEnd = (id) => {
          setLiveMessages((prev) =>
            prev.filter((msg) => msg.id !== id && !msg.isStreaming)
          );
        };

        const uiMessageContent =
          messageType === "protocol"
            ? `Executing protocol: ${messageContent}`
            : messageContent;

        const userDisplayMessage: ChatMessage = {
          id: `temp-${Date.now()}`, // Mark as temporary
          content: uiMessageContent,
          sender: "user",
          timestamp: new Date(),
          taskId: activeTaskId || undefined,
          isTemporary: true, // Add this flag
          files: filesData && filesData.length > 0 ? filesData : [],

        };

        setLiveMessages((prev) => [...prev, userDisplayMessage]);

        const baseMessageId = `${Date.now()}-response`;
        messageIdMappings.current.set(baseMessageId, {
          baseId: baseMessageId,
          streamingIds: [],
        });

        const streamUrl = `${import.meta.env.VITE_API_URL
          }/sessions/${projectId}/messages`;

        const controller = streamChat(
          streamUrl,
          (id, name) => {
            const matchingCastMember = castMembers?.find(
              (cm) => cm.name.toLowerCase() === name.toLowerCase()
            );
            const newMessage: ChatMessage = {
              id: id,
              content: "",
              sender: "agent",
              agentId: matchingCastMember?.id,
              speakerName: name,
              timestamp: new Date(),
              taskId: activeTaskId || undefined,
              isStreaming: true,
            };
            setLiveMessages((prev) => {
              if (prev.some((msg) => msg.id === id)) {
                return prev; // Skip if ID already exists
              }
              return [...prev, newMessage];
            });
            if (activeTaskId) addMessageToTask(activeTaskId, id);
            const mapping = messageIdMappings.current.get(baseMessageId);
            if (mapping) {
              mapping.streamingIds.push(id);
              messageIdMappings.current.set(baseMessageId, mapping);
            }
          },
          (id, content) => {
            setLiveMessages((prev) =>
              prev.map((msg) =>
                msg.id === id ? { ...msg, content: msg.content + content } : msg
              )
            );
          },
          (id) => {
            const mapping = messageIdMappings.current.get(baseMessageId);
            if (mapping) {
              setLiveMessages((prev) =>
                prev.map((msg) =>
                  mapping.streamingIds.includes(msg.id)
                    ? { ...msg, isStreaming: false }
                    : msg
                )
              );
              messageIdMappings.current.delete(baseMessageId);
            } else {
              setLiveMessages((prev) =>
                prev.map((msg) =>
                  msg.id === id ? { ...msg, isStreaming: false } : msg
                )
              );
            }
            activeStreamingConnections.current =
              activeStreamingConnections.current.filter(
                (c) => c !== controller
              );
            setIsAwaitingResponse(false);
          },
          (error) => {
            console.error("Streaming error:", error);
            const mapping = messageIdMappings.current.get(baseMessageId);
            if (mapping && mapping.streamingIds.length > 0) {
              setLiveMessages((prev) =>
                prev.map((msg) =>
                  mapping.streamingIds.includes(msg.id)
                    ? {
                      ...msg,
                      content:
                        msg.content + " [Error: Connection interrupted]",
                      isStreaming: false,
                    }
                    : msg
                )
              );
            } else {
              const errorMessage: ChatMessage = {
                id: `${Date.now()}-error`,
                content: "Error: Connection interrupted",
                sender: "agent",
                agentId: undefined,
                timestamp: new Date(),
                taskId: activeTaskId || undefined,
                isStreaming: false,
              };
              setLiveMessages((prev) => [...prev, errorMessage]);
            }
            if (baseMessageId) messageIdMappings.current.delete(baseMessageId);
            activeStreamingConnections.current =
              activeStreamingConnections.current.filter(
                (c) => c !== controller
              );
            setIsAwaitingResponse(false);
          },
          {
            type: messageType,
            content: messageContent,
            castIds: enabledCastId,
            enableWebSearch: enableWebSearch,
            ...(filesData && filesData.length ? { files: filesData } : {}),
          }
        );
        activeStreamingConnections.current.push(controller);

        if (messageType === "message") {
          onSendMessage(
            messageContent,
            enabledCastId ? [enabledCastId] : [], // Pass as array with single item
            showTaskInput ? taskTitle : undefined
          );
        }
      },
      [
        projectId,
        enabledCastId,
        activeTaskId,
        addMessageToTask,
        castMembers,
        onSendMessage,
        showTaskInput,
        taskTitle,
        enableWebSearch,
      ]
    );

    useEffect(() => {
      if (historicalData && historicalData.pages.length > 0) {
        const historicalIds = new Set(
          historicalData.pages.flatMap((page) => page.messages.map((m) => m.id))
        );

        setLiveMessages((prev) => {
          const filtered = prev.filter((msg) => {
            const shouldBeRemoved =
              msg.isTemporary || historicalIds.has(msg.id);

            return !shouldBeRemoved;
          });
          return filtered;
        });
      }
    }, [historicalData]);

    const handleSubmit = (e: FormEvent) => {
      e.preventDefault();
      if (prompt.trim() === "" || isAwaitingResponse) return;
      setIsAwaitingResponse(true);
      sendMessageToServer(prompt, "message", uploadedFilesData.length ? uploadedFilesData : null);
      setSelectedFiles([]);
      setUploadedFilesData([]);
      setUploadProgress([]);
      setPrompt("");
      if (showTaskInput) {
        setTaskTitle("");
        if (onCloseTaskInput) onCloseTaskInput();
      }
    };

    const handleProtocolActivation = useCallback(
      async (protocolName: string) => {
        const formattedContent = `${protocolName}`;
        setIsAwaitingResponse(true);
        await sendMessageToServer(formattedContent, "protocol");
      },
      [sendMessageToServer]
    );

    useImperativeHandle(ref, () => ({
      handleProtocolActivation,
    }));

    const activeTask = getActiveTask();

    const handleInitiateFork = () => {
      setForkTaskTitle(`Fork of ${sessionData.title}`);
      setIsForkingDialogOpen(true);
    };

    const handleConfirmFork = async () => {
      try {
        const newSession = await forkSessionMutation.mutateAsync({
          originalSessionId: projectId,
          title: forkTaskTitle.trim() || undefined,
        });
        navigate(`/dashboard/projects/${newSession.sessionId}`);
        setIsForkingDialogOpen(false);
        setForkTaskTitle("");
      } catch (error) {
        console.error("Forking failed (details in toast):", error);
      }
    };

    // Define custom components for ReactMarkdown with proper styling
    const MarkdownComponents = {
      h1: ({ node, ...props }) => (
        <h1 className="text-2xl font-bold my-3" {...props} />
      ),
      h2: ({ node, ...props }) => (
        <h2 className="text-xl font-bold my-2.5" {...props} />
      ),
      h3: ({ node, ...props }) => (
        <h3 className="text-lg font-bold my-2" {...props} />
      ),
      h4: ({ node, ...props }) => (
        <h4 className="text-base font-bold my-2" {...props} />
      ),
      h5: ({ node, ...props }) => (
        <h5 className="text-sm font-bold my-1.5" {...props} />
      ),
      h6: ({ node, ...props }) => (
        <h6 className="text-xs font-bold my-1" {...props} />
      ),
      strong: ({ node, ...props }) => (
        <strong className="font-bold" {...props} />
      ),
      em: ({ node, ...props }) => <em className="italic" {...props} />,
      ul: ({ node, ...props }) => (
        <ul className="list-disc pl-5 my-2" {...props} />
      ),
      ol: ({ node, ...props }) => (
        <ol className="list-decimal pl-5 my-2" {...props} />
      ),
      li: ({ node, ...props }) => <li className="my-1" {...props} />,
      p: ({ node, ...props }) => <p className="my-2" {...props} />,
      a: ({ node, ...props }) => (
        <a className="text-primary underline" {...props} />
      ),
      blockquote: ({ node, ...props }) => (
        <blockquote
          className="border-l-4 border-primary/30 pl-4 italic my-2"
          {...props}
        />
      ),
      code: ({ node, inline, className, children, ...props }) => {
        const match = /language-(\w+)/.exec(className || "");
        return !inline ? (
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={match ? match[1] : "text"}
            PreTag="div"
            className="rounded-md my-3"
            {...props}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        ) : (
          <code
            className="bg-muted/40 px-1.5 py-0.5 rounded font-mono text-sm"
            {...props}
          >
            {children}
          </code>
        );
      },
      pre: ({ node, ...props }) => <pre className="my-3" {...props} />,
      table: ({ node, ...props }) => (
        <div className="overflow-auto my-3">
          <table className="border-collapse w-full" {...props} />
        </div>
      ),
      thead: ({ node, ...props }) => (
        <thead className="bg-muted/20" {...props} />
      ),
      tbody: ({ node, ...props }) => <tbody {...props} />,
      tr: ({ node, ...props }) => (
        <tr className="border-b border-border/40" {...props} />
      ),
      th: ({ node, ...props }) => (
        <th className="py-2 px-3 text-left font-semibold" {...props} />
      ),
      td: ({ node, ...props }) => <td className="py-2 px-3" {...props} />,
    };

    if (isLoading) {
      return (
        <div className="flex flex-col h-full  items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">
            Loading Chat Interface...
          </p>
        </div>
      );
    }

    if (isErrorCast) {
      return (
        <div className="flex flex-col h-full bg-card items-center justify-center p-4">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <p className="mt-2 text-destructive-foreground text-center">
            Error loading cast members: {errorCast?.message || "Unknown error"}
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      );
    }

    const uploader = new S3MultipartUploadService();

    const handleFileUpload = (): Promise<{ uniqueName: string; originalName: string }[] | null> => {
      return new Promise((resolve, reject) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "*/*";
        input.multiple = true;

        input.onchange = async (e: any) => {
          const files: File[] = Array.from(e.target.files);
          // const file = e.target.files[0];
          // if (!file) return resolve(null);

          // Check max limit
          if (files.length + selectedFiles.length > maxFiles) {
            toast({
              title: "Limit Exceeded",
              description: `You can upload up to ${maxFiles} files.`,
              variant: "destructive",
            });
            return resolve(null);
          }

          const newSelectedFiles = [...selectedFiles, ...files];
          setSelectedFiles(newSelectedFiles);
          setUploadProgress(new Array(newSelectedFiles.length).fill(0));

          const newUploadedFilesData: { uniqueName: string; originalName: string }[] = [];

          for (let i = selectedFiles.length; i < newSelectedFiles.length; i++) {
            const file = newSelectedFiles[i];
            const uniqueFileName = `uploads/${sessionData.userId}/${Date.now()}-${file.name.replace(/[\s-]+/g, "_")}`;

            try {
              const uploadedUrl = await uploader.uploadFile(uniqueFileName, file, (progress) => {
                setUploadProgress((prev) => {
                  const updated = [...prev];
                  updated[i] = Math.round((progress.loaded / progress.total) * 100);
                  return updated;
                });
              });
              newUploadedFilesData.push({ uniqueName: uniqueFileName, originalName: file.name });
            } catch (err) {
              console.error("Upload failed:", err);
              toast({
                title: "Upload Failed",
                description: `Upload failed for file: ${file.name}`,
                variant: "destructive",
              });
            }
          }

          setUploadedFilesData((prev) => [...prev, ...newUploadedFilesData]);
          resolve(newUploadedFilesData);
        };

        input.click();
      });
    };

    const handleCancelUpload = async (index: number) => {
      try {
        await uploader.cancelUpload();

        toast({
          title: "Upload Cancelled",
          description: `Upload for "${selectedFiles[index].name}" was cancelled.`,
        });

        // Cleanly remove the cancelled file from state
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
        setUploadedFilesData((prev) => prev.filter((_, i) => i !== index));
        setUploadProgress((prev) => prev.filter((_, i) => i !== index));
      } catch (err) {
        console.error("Error cancelling upload:", err);
      }
    };

    const handleRemoveFile = (index: number) => {
      setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
      setUploadedFilesData((prev) => prev.filter((_, i) => i !== index));
      setUploadProgress((prev) => prev.filter((_, i) => i !== index));
    };


    return (
      <div className="flex flex-col rounded-3xl h-full overflow-hidden ">
        <div
          className={`sticky rounded-t-3xl top-0 z-10 ${isMobile ? "p-2 pb-1" : ""}`}
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-between w-full gap-4"
          >
            <ChatHeader
              isMobile={isMobile}
              handleInitiateFork={handleInitiateFork}
              forkSessionMutation={forkSessionMutation}
              castMembers={castMembers}
              enabledCastId={enabledCastId}
              handleToggleCastEnabled={handleToggleCastEnabled}
              onSelectedCastChange={handleSelectedCastMemberChange}
            />

          </motion.div>
        </div>

        <div
          className={`flex-1 ${isMobile ? "px-2 pb-2" : "px-0"
            } flex flex-col overflow-hidden`}
        >
          <Card className="flex-1 flex flex-col w-full rounded-3xl border-none shadow-sm overflow-hidden">
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              <ScrollArea
                ref={scrollAreaRef}
                className={`flex-1 ${isMobile ? "p-2" : "px-2.5"}`}
                type="always">
                {isLoadingHistorical && (
                  <div className="flex justify-center items-center py-2">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <p className="ml-2 text-muted-foreground text-sm">
                      Loading history...
                    </p>
                  </div>
                )}
                {isErrorHistorical && !isLoadingHistorical && (
                  <div className="flex flex-col items-center justify-center py-2 text-red-500 text-sm">
                    <p>Error loading message history.</p>
                  </div>
                )}
                {!isLoadingHistorical && hasNextPage && (
                  <div className="text-center mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLoadPrevious}
                      disabled={isFetchingNextPage}
                      className="border-border/40 hover:border-primary/50 h-7 text-xs"
                    >
                      {isFetchingNextPage ? (
                        <>
                          <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "Load Previous Messages"
                      )}
                    </Button>
                  </div>
                )}
                {allMessages.length === 0 &&
                  !isLoadingHistorical &&
                  !hasCastMembers &&
                  !isErrorHistorical && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="flex flex-col items-center justify-center h-full text-center"
                    >
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <div
                          className={`${isMobile ? "p-3" : "p-4"
                            } rounded-full bg-muted/10 mb-3`}
                        >
                          <Send
                            className={`${isMobile ? "h-5 w-5" : "h-6 w-6"
                              } text-muted-foreground/40`}
                          />
                        </div>

                        <p
                          className={`${isMobile ? "text-xs px-3" : "text-sm"
                            } text-muted-foreground max-w-md mb-4`}
                        >
                          No cast members available. Please create one to get
                          started.
                        </p>

                        <Link to="/dashboard/cast-members/new">
                          <Button className="CreateNewCastMemberClick">
                            <Plus className="h-4 w-4 mr-2" /> Create New Cast
                            Member
                          </Button>
                        </Link>
                      </div>

                      {/* <div
                        className={`${
                          isMobile ? "p-3" : "p-4"
                        } rounded-full bg-muted/10 mb-3`}
                      >
                        <Send
                          className={`${
                            isMobile ? "h-5 w-5" : "h-6 w-6"
                          } text-muted-foreground/40`}
                        />
                      </div>
                      <p
                        className={`${
                          isMobile ? "text-xs px-3" : "text-sm"
                        } text-muted-foreground max-w-md`}
                      >
                        {activeTask
                          ? "You're working on a task. Enable cast members and start the conversation."
                          : "No active task. Use the 'Begin' protocol to create a new task, then enable cast members and start the conversation."}
                      </p> */}
                    </motion.div>
                  )}
                {!isRefreshing && allMessages.length > 0 && (
                  <div className={`space-y-${isMobile ? "2" : "3"}`}>
                    <AnimatePresence>
                      {allMessages?.map((message) => {
                        let castMemberDisplay:
                          | CastMemberType
                          | null
                          | undefined = null;
                        if (message.agentId) {
                          castMemberDisplay = castMembers?.find(
                            (cm) => cm.id === message.agentId
                          );
                        } else if (message.speakerName) {
                          castMemberDisplay = castMembers?.find(
                            (cm) =>
                              cm.name.toLowerCase() ===
                              message.speakerName?.toLowerCase()
                          );
                        }

                        let historicalAgentNameFallback: string | undefined =
                          undefined;
                        if (
                          !castMemberDisplay &&
                          message.sender === "agent" &&
                          !message.isStreaming &&
                          !message.speakerName
                        ) {
                          const match = message.content.match(/^([^:]+):\s*/);
                          if (match && match[1]) {
                            const foundCast = castMembers?.find(
                              (a) =>
                                a.name.toLowerCase() === match[1].toLowerCase()
                            );
                            if (foundCast) {
                              historicalAgentNameFallback = foundCast.name;
                            } else {
                              historicalAgentNameFallback = match[1];
                            }
                          }
                        }

                        const displayAgentName =
                          castMemberDisplay?.name ||
                          message.speakerName ||
                          historicalAgentNameFallback ||
                          "Assistant";
                        const displayAgentInitial = displayAgentName
                          ? displayAgentName[0]?.toUpperCase()
                          : "A";

                        return (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`flex ${message.sender === "user"
                              ? "justify-end"
                              : "justify-start"
                              }`}
                          >
                            <div
                              className={`rounded-2xl ${isMobile ? "p-1.5" : "p-2.5"
                                } max-w-[90%] ${message.sender === "user"
                                  ? "glassy-chat-user text-foreground ml-2"
                                  : "glassy-chat-ai mr-2 text-foreground "
                                }`}
                            >
                              {message.sender === "agent" && (
                                <div className="flex items-center mb-1 ">
                                  <Avatar className="h-5 w-5 mr-1.5">
                                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-ubuntu">
                                      {displayAgentInitial}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs font-medium font-ubuntu">
                                    {displayAgentName}
                                  </span>
                                </div>
                              )}
                              <div
                                className={`${isMobile ? "text-xs" : "text-sm"
                                  } leading-relaxed prose font-ubuntu dark:prose-invert max-w-full prose-sm`}
                              >
                                {(() => {
                                  let contentToRender = message.content;
                                  // Regex to remove ```optional_lang\n ... \n``` or ```\n ... \n```
                                  const fencedBlockRegex =
                                    /^```(?:[a-zA-Z]*\n)?([\s\S]*?)\n```$/;
                                  const match =
                                    contentToRender.match(fencedBlockRegex);
                                  if (match && match[1]) {
                                    contentToRender = match[1];
                                  }
                                  // Add a simpler check for content that might just be ```code``` on one line (less common for blocks)
                                  else if (
                                    contentToRender.startsWith("```") &&
                                    contentToRender.endsWith("```")
                                  ) {
                                    const lines = contentToRender.split("\n");
                                    if (lines.length === 1) {
                                      // Single line ```code```
                                      contentToRender =
                                        contentToRender.substring(
                                          3,
                                          contentToRender.length - 3
                                        );
                                    } else if (lines.length > 1) {
                                      // Multi-line but regex didn't catch it, more careful strip
                                      // This case might be redundant if the regex is good
                                    }
                                  }
                                  // Clean any leftover code block markers
                                  const cleanContent = contentToRender
                                    .replace(/^```[\s\S]*?```$/gm, (match) => {
                                      // Extract content from code blocks
                                      const inner = match
                                        .substring(3, match.length - 3)
                                        .trim();
                                      return inner.startsWith("markdown")
                                        ? inner.substring(8).trim() // Remove 'markdown' language specifier
                                        : inner;
                                    })
                                    .replace(/```(?:markdown)?/g, "");

                                  return (
                                    <div className="markdown-message">
                                      {message.files && message.files.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                          {message.files.map((file, i) => {
                                            const ext = file.originalName.split(".").pop()?.toLowerCase() || "";
                                            const iconMap: Record<string, string> = {
                                              pdf: pdfIcon,
                                              doc: wordIcon,
                                              docx: wordIcon,
                                              xls: excelIcon,
                                              xlsx: excelIcon,
                                              ppt: powerPointIcon,
                                              pptx: powerPointIcon,
                                              txt: fileIcon,
                                            };

                                            const iconSrc = iconMap[ext] || fileIcon;

                                            return (
                                              <div
                                                key={i}
                                                className="flex flex-col items-center justify-center w-20 h-20 bg-gradient-to-tr from-indigo-200 to-indigo-300 rounded-xl shadow-md overflow-hidden hover:scale-105 transition-transform"
                                              >
                                                <img src={iconSrc} alt={ext} className="h-10 w-10 object-contain" />
                                                <p className="text-[10px] text-center text-primary-foreground px-1 truncate">{file.originalName}</p>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                      <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={MarkdownComponents}
                                      >
                                      </ReactMarkdown>

                                      {/* Render markdown content separately so ReactMarkdown receives only a string */}
                                      <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={MarkdownComponents}
                                      >
                                        {cleanContent}
                                      </ReactMarkdown>
                                    </div>
                                  );
                                })()}
                                {message.isStreaming && (
                                  <span className="inline-block animate-pulse"></span>
                                )}
                              </div>
                              <div className="flex justify-between items-center mt-1">
                                <p
                                  className={`${isMobile ? "text-[9px]" : "text-[10px]"
                                    } text-muted-foreground`}
                                >
                                  {new Intl.DateTimeFormat("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                  }).format(message.timestamp)}
                                </p>
                                {message.taskId && (
                                  <Badge
                                    variant="outline"
                                    className={`${isMobile
                                      ? "text-[9px] px-1 py-0"
                                      : "text-[10px] px-1 py-0"
                                      }`}
                                  >
                                    Task
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      }) || []}
                      {/* Show AI loader only if waiting for response AND no message is streaming */}
                      {isAwaitingResponse && !allMessages.some((msg) => msg.isStreaming) && (
                        <motion.div
                          key="thinking-loader"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex justify-start"
                        >
                          <div
                            className={`rounded-2xl ${isMobile ? "p-1.5" : "p-2.5"}
                             max-w-[90%] mr-2 text-foreground flex items-center space-x-2`}
                          >
                            {/* Replace Ailoader with avatar image */}
                            <img
                              src={selectedCastMember?.avatar}
                              alt={selectedCastMember?.name}
                              className="w-7 h-7 rounded-full object-cover"
                            />
                            <span className={`${isMobile ? "text-xs" : "text-base"} text-muted-foreground`}>
                              {selectedCastMember?.name} is thinking
                            </span>
                            <div className="typing-dots ml-2">
                              <span></span>
                              <span></span>
                              <span></span>
                            </div>
                          </div>
                        </motion.div>

                      )}

                    </AnimatePresence>
                  </div>
                )}
              </ScrollArea>

              <div
                className={`${isMobile ? "p-2" : "p-3 mt-2"
                  } border-t border-border/30 bg-muted/5`}
              >
                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-2 items-end">
                  {showTaskInput && (
                    <AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="w-full "
                      >
                        <Input
                          placeholder="Enter task title..."
                          value={taskTitle}
                          onChange={(e) => setTaskTitle(e.target.value)}
                          className="rounded-xl border-border/40 bg-background mb-1 border-blue-300 "
                          autoComplete="off"
                          autoFocus
                        />
                      </motion.div>
                    </AnimatePresence>
                  )}

                  {/* Web Search Toggle */}
                  {/* <div className="flex items-center space-x-2 w-full mb-1">
                    <Search className="h-4 w-4 text-muted-foreground " />
                    <Label
                      htmlFor="web-search-toggle"
                      className="text-sm text-muted-foreground font-ubuntu"
                    >
                      Enable Web Search
                    </Label>
                    <Switch
                      id="web-search-toggle"
                      checked={enableWebSearch}
                      onCheckedChange={setEnableWebSearch}
                      className="ml-auto"
                    />
                  </div> */}
                  {/* Message Input */}
                  <div className="flex flex-col w-full  items-center ">
                    <div className="w-full flex-1 flex flex-col gap-1">
                      {/* File Display and Remove Button - Integrated into the input area look */}

                      {selectedFiles.length > 0 && (
                        <div className="flex flex-wrap gap-3 mb-3">
                          {selectedFiles.map((file, i) => {
                            const isUploading = uploadProgress[i] < 100;
                            const isLatestFile = i === selectedFiles.length - 1 && isUploading;

                            const getFilePreview = (file: File) => {
                              const name = file.name || "";
                              const type = file.type || "";
                              const ext = name.split(".").pop()?.toLowerCase() || "";

                              // Show image thumbnail for image files
                              if (type.startsWith("image") || ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
                                return (
                                  <img
                                    src={imageIcon}
                                    alt={name}
                                    className="h-10 w-10 object-cover rounded-lg shadow"
                                  />
                                );
                              }

                              // Map extension → icon image
                              const iconMap: Record<string, string> = {
                                pdf: pdfIcon,
                                doc: wordIcon,
                                docx: wordIcon,
                                xls: excelIcon,
                                xlsx: excelIcon,
                                ppt: powerPointIcon,
                                pptx: powerPointIcon,
                                txt: fileIcon,
                              };

                              const iconSrc = iconMap[ext] || fileIcon;
                              return (
                                <img
                                  src={iconSrc}
                                  alt={ext}
                                  className="h-10 w-10 object-contain rounded-lg shadow"
                                />
                              );
                            };

                            return (
                              <div
                                key={i}
                                className="relative group w-20 h-20 bg-gradient-to-tr from-indigo-200 to-indigo-300 rounded-xl shadow-md flex flex-col items-center justify-center overflow-hidden hover:scale-105 transition-transform duration-200"
                              >
                                {getFilePreview(file)}

                                <div className="absolute bottom-0 w-full text-center text-[10px] bg-black/70 text-white py-0.5 px-1 overflow-hidden whitespace-nowrap text-ellipsis group-hover:whitespace-normal group-hover:overflow-visible group-hover:bg-black/80 group-hover:rounded">
                                  {file.name}
                                </div>

                                {/* Loader only on latest uploading file */}
                                {isLatestFile && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                                    <div className="w-7 h-7 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                  </div>
                                )}

                                {/* Cancel Upload Button */}
                                {isLatestFile && (
                                  <button
                                    onClick={() => handleCancelUpload(i)}
                                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow"
                                    title="Cancel Upload"
                                  >
                                    ✕
                                  </button>
                                )}

                                {/* Remove Button - shown only after upload complete */}
                                {!isUploading && (
                                  <button
                                    onClick={() => handleRemoveFile(i)}
                                    className="absolute top-1 right-1 bg-gray-500 hover:bg-gray-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow"
                                    title="Remove File"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            );


                          })}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-row gap-3 w-full">
                      <div className={`relative flex items-center w-full h-12 rounded-2xl bg-muted/50 border border-transparent focus-within:border-primary/50 transition-all ${isMobile ? "h-10" : "h-10"}`}>
                        <Input
                          placeholder="Enter your prompt..."
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault(); // stop default form submit
                              // simulate form submit manually
                              handleSubmit(e as unknown as FormEvent);
                            }
                          }}
                          // Important: Remove default border and background, adjust padding for internal element space
                          className="w-full h-full rounded-2xl border-none bg-transparent font-sans flex-1 pl-4 pr-12 focus-visible:ring-0 focus-visible:ring-offset-0"
                          autoComplete="off"
                        />
                      </div>

                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="py-1"
                      >
                        <Button
                          type="button"
                          size="icon"
                          className={`bg-gradient-to-r from-indigo-500/80 to-purple-500/80 
                                text-white font-medium shadow-[inset_1px_1px_6px_rgba(255,255,255,0.6),inset_-2px_-2px_6px_rgba(0,0,0,0.15)]
                                  hover:shadow-[0_0_12px_rgba(131,113,243,0.8),inset_1px_1px_6px_rgba(255,255,255,0.6)]
                                  border-[3px] border-white/50
                                  backdrop-blur-3xl rounded-full ${isMobile ? "h-9 w-9" : "h-10 w-10 "
                            } `}
                          onClick={handleFileUpload}
                        >
                          <Upload
                            className={`${isMobile ? "h-4 w-4" : "h-5 w-5"}`}
                          />
                        </Button>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="py-1"
                      >
                        <Button
                          type="submit"
                          size="icon"
                          className={`bg-gradient-to-r from-indigo-500/80 to-purple-500/80 
                                text-white font-medium shadow-[inset_1px_1px_6px_rgba(255,255,255,0.6),inset_-2px_-2px_6px_rgba(0,0,0,0.15)]
                                  hover:shadow-[0_0_12px_rgba(131,113,243,0.8),inset_1px_1px_6px_rgba(255,255,255,0.6)]
                                  border-[3px] border-white/50
                                  backdrop-blur-3xl rounded-full ${isMobile ? "h-9 w-9" : "h-10 w-10"
                            } `}
                          disabled={
                            !enabledCastId ||
                            (prompt.trim() === "" && uploadedFilesData.length === 0) ||
                            isAwaitingResponse ||
                            !hasCastMembers
                          }
                        >
                          <Send
                            className={`${isMobile ? "h-4 w-4" : "h-5 w-5"}`}
                          />
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </motion.form>
              </div>
            </CardContent>
          </Card>
        </div>

        <Dialog
          open={isForkingDialogOpen}
          onOpenChange={setIsForkingDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-color">Create New Task (Fork Session)</DialogTitle>
              <DialogDescription>
                This will create a new task (a child session) based on the
                current conversation. You can give the new task a title.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="forkTaskTitle" className="text-right text-color">
                  Task Title
                </Label>
                <Input
                  id="forkTaskTitle"
                  value={forkTaskTitle}
                  onChange={(e) => setForkTaskTitle(e.target.value)}
                  className="col-span-3 glass-search "
                  placeholder={`Fork of ${sessionData.title}`}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={forkSessionMutation.isPending}
                  className="text-color mt-2 border-w"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                className="bg-gradient-to-r from-indigo-500/80 to-purple-500/80 
    text-white font-medium shadow-[inset_1px_1px_6px_rgba(255,255,255,0.6),inset_-2px_-2px_6px_rgba(0,0,0,0.15)]
    hover:shadow-[0_0_12px_rgba(131,113,243,0.8),inset_1px_1px_6px_rgba(255,255,255,0.6)]
    border-[3px] border-white/50
    backdrop-blur-3xl"
                type="button"
                onClick={handleConfirmFork}
                disabled={
                  forkSessionMutation.isPending || !forkTaskTitle.trim()
                }
              >
                {forkSessionMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Create Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div >
    );
  }
);
