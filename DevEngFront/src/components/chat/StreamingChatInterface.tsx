
import { useState, ChangeEvent, FormEvent, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AgentType } from "../agents/AgentCard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "../ui/input";
import { useTasks } from "@/contexts/TaskContext";
import { Badge } from "../ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { useChat, ChatMessage as ChatMessageType } from "@/hooks/use-chat";

interface StreamingChatInterfaceProps {
  projectId: string;
  projectTitle: string;
  projectAgents: AgentType[];
  showTaskInput?: boolean;
  onCloseTaskInput?: () => void;
  hideTitleOnMobile?: boolean;
}

export function StreamingChatInterface({
  projectId,
  projectTitle,
  projectAgents,
  showTaskInput = false,
  onCloseTaskInput,
  hideTitleOnMobile = false
}: StreamingChatInterfaceProps) {
  const [prompt, setPrompt] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { activeTaskId, addMessageToTask, getActiveTask } = useTasks();
  const isMobile = useIsMobile();
  
  const { messages, isLoading, sendMessage } = useChat();
  
  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages]);

  const handleAgentSelection = (agentId: string) => {
    setSelectedAgents(prev => prev.includes(agentId) ? prev.filter(id => id !== agentId) : [...prev, agentId]);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (prompt.trim() === "" || selectedAgents.length === 0) return;

    // Send message with streaming
    sendMessage(prompt, {
      agents: selectedAgents,
      taskTitle: showTaskInput ? taskTitle : undefined,
      taskId: activeTaskId || undefined,
      projectId
    });

    // Associate message with active task if one exists
    if (activeTaskId) {
      messages.forEach(message => {
        addMessageToTask(activeTaskId, message.id);
      });
    }
    
    // Clear inputs after sending
    setPrompt("");
    if (showTaskInput) {
      setTaskTitle("");
      if (onCloseTaskInput) onCloseTaskInput();
    }
  };

  const activeTask = getActiveTask();

  // Render the chat interface
  return (
    <div className="flex flex-col h-full">
      <div className={`${isMobile ? "p-3 pb-2" : "p-6 pb-3"}`}>
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`${isMobile ? "mb-2" : "mb-4"}`}
        >
          <h3 className={`${isMobile ? "text-base" : "text-lg"} font-medium mb-2 flex items-center justify-between`}>
            {(!isMobile || !hideTitleOnMobile) && <span>{projectTitle || "Project"}</span>}
            
            {activeTask && (
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
                  Active Task
                </Badge>
                <span className="text-sm font-medium">{activeTask.name}</span>
                <Badge variant="outline" className="text-xs">
                  {activeTask.associatedMessages.length} messages
                </Badge>
              </div>
            )}
          </h3>
          
          <div className="flex flex-wrap gap-2 mb-2">
            {projectAgents.map(agent => (
              <motion.div 
                key={agent.id} 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant={selectedAgents.includes(agent.id) ? "default" : "outline"} 
                  className={`flex items-center gap-2 rounded-xl ${
                    selectedAgents.includes(agent.id) ? "bg-primary/90 text-primary-foreground" : "border-border/50 hover:border-border"
                  }`} 
                  onClick={() => handleAgentSelection(agent.id)}
                  size="sm"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className={selectedAgents.includes(agent.id) ? "bg-primary-foreground text-primary" : "bg-muted text-muted-foreground"}>
                      {agent.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span>{agent.name}</span>
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
      
      <div className={`flex-1 ${isMobile ? "px-3 pb-3" : "px-6 pb-6"} flex`}>
        <Card className="flex flex-col w-full rounded-3xl border-border/30 shadow-sm overflow-hidden">
          <div className={`${isMobile ? "p-3" : "p-4"} border-b border-border/30 bg-muted/5`}>
            <h2 className={`${isMobile ? "text-base" : "text-lg"} font-medium`}>Project Conversation</h2>
            <p className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>
              Chat with your selected AI agents
            </p>
          </div>
          
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            <ScrollArea 
              ref={scrollAreaRef}
              className={`flex-1 ${isMobile ? "p-4" : "p-6"}`}
              type="always"
            >
              {messages.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col items-center justify-center h-full text-center"
                >
                  <div className={`${isMobile ? "p-4" : "p-6"} rounded-full bg-muted/10 mb-4`}>
                    <Send className={`${isMobile ? "h-6 w-6" : "h-8 w-8"} text-muted-foreground/40`} />
                  </div>
                  <p className={`${isMobile ? "text-sm px-4" : "text-base"} text-muted-foreground max-w-md`}>
                    {activeTask 
                      ? "You're working on a task. Select agents and start the conversation."
                      : "No active task. Use the 'Begin' protocol to create a new task, then select agents and start the conversation."}
                  </p>
                </motion.div>
              ) : (
                <div className={`space-y-${isMobile ? "3" : "6"}`}>
                  <AnimatePresence>
                    {messages.map(message => {
                      const agent = message.agentId ? projectAgents.find(a => a.id === message.agentId) : null;
                      return (
                        <motion.div 
                          key={message.id} 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`rounded-2xl ${isMobile ? "p-2" : "p-4"} max-w-[85%] ${
                              message.sender === 'user' 
                                ? 'bg-primary/10 border border-primary/20 text-foreground ml-4' 
                                : 'bg-muted/10 border border-border/30 mr-4'
                            }`}
                          >
                            {message.sender === 'agent' && agent && (
                              <div className="flex items-center mb-2">
                                <Avatar className="h-6 w-6 mr-2">
                                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                    {agent.name[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">{agent.name}</span>
                                {message.isStreaming && (
                                  <Badge variant="outline" className="ml-2 animate-pulse">
                                    Typing...
                                  </Badge>
                                )}
                              </div>
                            )}
                            <p className={`${isMobile ? "text-xs" : "text-sm"} leading-relaxed`}>{message.content}</p>
                            <div className="flex justify-between items-center mt-2">
                              <p className={`${isMobile ? "text-[10px]" : "text-xs"} text-muted-foreground`}>
                                {new Intl.DateTimeFormat('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit'
                                }).format(message.timestamp)}
                              </p>
                              {message.taskId && (
                                <Badge variant="outline" className={`${isMobile ? "text-[10px] px-1" : "text-xs"}`}>
                                  Task
                                </Badge>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </ScrollArea>
            
            <div className={`${isMobile ? "p-3" : "p-4"} border-t border-border/30 bg-muted/5`}>
              <motion.form 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                onSubmit={handleSubmit} 
                className="flex flex-col gap-3 items-end"
              >
                {showTaskInput && (
                  <AnimatePresence>
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="w-full"
                    >
                      <Input
                        placeholder="Enter task title..."
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        className="rounded-xl border-border/40 bg-background mb-2 border-blue-300"
                        autoComplete="off"
                        autoFocus
                      />
                    </motion.div>
                  </AnimatePresence>
                )}
                
                <div className="flex w-full gap-3 items-center">
                  <Input
                    placeholder="Enter your prompt..."
                    value={prompt}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPrompt(e.target.value)}
                    className={`rounded-xl flex-1 border-border/40 bg-background ${isMobile ? "h-10" : ""}`}
                    autoComplete="off"
                  />
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      type="submit" 
                      size="icon" 
                      className={`rounded-full ${isMobile ? "h-10 w-10" : "h-10 w-10"} bg-primary`}
                      disabled={selectedAgents.length === 0 || !prompt.trim() || (showTaskInput && !taskTitle.trim()) || isLoading}
                    >
                      <Send className={`${isMobile ? "h-5 w-5" : "h-5 w-5"}`} />
                    </Button>
                  </motion.div>
                </div>
              </motion.form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
