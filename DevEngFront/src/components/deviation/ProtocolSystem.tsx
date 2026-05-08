import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useProtocols } from "@/hooks/use-protocols";
import { ProtocolType } from "@/services/protocolService";
import {
  Loader2,
  AlertTriangle,
  ListTree,
  FileText,
  Plus,
  Zap,
  Settings,
  Layers,
  Edit,
  Trash2,
  MoreVertical,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SessionTree from "@/components/sessions/SessionTree";
import { useSessionQuery } from "@/hooks/use-session";
import {
  Link,
  useParams,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import { ProtocolCreator } from "./ProtocolCreator";
import { ProtocolExecutor } from "./ProtocolExecutor";
import { useToast } from "@/hooks/use-toast";
// import ProtocolWalkthrough from "../Walkthrough/ProtocolWalkthrough";
import { secureStorage } from "@/lib/secureStorage";

// UI-specific fields for displaying protocols
export interface DisplayProtocolType extends ProtocolType {
  category?: string;
  icon?: React.ElementType;
}

interface ProtocolSystemProps {
  currentSessionId: string;
  onActivateProtocol: (protocolName: string) => void;
}

// Enhanced mapping with level-based icons
const protocolDisplayMap: Record<string, Partial<DisplayProtocolType>> = {
  Begin: { category: "Initiation", icon: FileText },
  "Loop It": { category: "Refinement", icon: FileText },
  Reflect: { category: "Analysis", icon: FileText },
};

const getLevelIcon = (level: 1 | 2 | 3) => {
  switch (level) {
    case 1:
      return Zap;
    case 2:
      return Settings;
    case 3:
      return Layers;
    default:
      return FileText;
  }
};

const getLevelColor = (level: 1 | 2 | 3) => {
  switch (level) {
    case 1:
      return "text-green-600 bg-green-50 border-green-200";
    case 2:
      return "text-blue-600 bg-blue-50 border-blue-200";
    case 3:
      return "text-purple-600 bg-purple-50 border-purple-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
};

const getLevelName = (level: 1 | 2 | 3) => {
  switch (level) {
    case 1:
      return "Static";
    case 2:
      return "Semi-Dynamic";
    case 3:
      return "Compositional";
    default:
      return "Unknown";
  }
};

const ProtocolSystem: React.FC<ProtocolSystemProps> = ({
  currentSessionId,
  onActivateProtocol,
}) => {
  const [runProtocol, setRunProtocol] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [isProtocolExecuting, setIsProtocolExecuting] = useState(false);

  const { useProtocolsQuery, useDeleteProtocol } = useProtocols();
  const {
    data: protocols,
    isLoading: isLoadingProtocols,
    isError: isErrorProtocols,
    error: errorProtocols,
  } = useProtocolsQuery();
  const deleteProtocolMutation = useDeleteProtocol();
  const { toast } = useToast();

  const {
    data: sessionData,
    isLoading: isLoadingSession,
    isError: isErrorSession,
    error: errorSession,
  } = useSessionQuery(currentSessionId);

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const defaultTab = searchParams.get("tab") || "protocols";

  const [selectedProtocol, setSelectedProtocol] = useState<ProtocolType | null>(
    null
  );
  const [executorOpen, setExecutorOpen] = useState(false);
  const [editingProtocol, setEditingProtocol] = useState<ProtocolType | null>(
    null
  );
  const [creatorOpen, setCreatorOpen] = useState(false);

  const [runModalWalkthrough, setRunModalWalkthrough] = useState(false);

  // State for collapsible levels - default to all expanded
  const [collapsedLevels, setCollapsedLevels] = useState<Set<number>>(() => {
    // Load collapsed state from localStorage
    try {
      const saved = localStorage.getItem("protocol-collapsed-levels");
      if (saved) {
        const parsedArray = JSON.parse(saved);
        return new Set(parsedArray);
      }
    } catch (error) {
      console.warn("Failed to load collapsed levels from localStorage:", error);
    }
    return new Set();
  });

  useEffect(() => {
    if (localStorage.getItem("triggerProtocolWalkthrough") === "false") {
      setRunProtocol(true);

      // directly get from secureStorage
      const storedUserType = secureStorage.getItem("user_type");
      setUserType(storedUserType);

      localStorage.removeItem("triggerProtocolWalkthrough");
    }
  }, []);

  const toggleLevel = (level: number) => {
    setCollapsedLevels((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(level)) {
        newSet.delete(level);
      } else {
        newSet.add(level);
      }

      // Save to localStorage
      try {
        localStorage.setItem(
          "protocol-collapsed-levels",
          JSON.stringify(Array.from(newSet))
        );
      } catch (error) {
        console.warn("Failed to save collapsed levels to localStorage:", error);
      }

      return newSet;
    });
  };

  const handleTabChange = (value: string) => {
    searchParams.set("tab", value);
    setSearchParams(searchParams);
  };

  const handleProtocolCreated = (protocol: ProtocolType) => {
    // Refresh protocols list or handle the new protocol
  };

  const handleProtocolClick = (protocol: ProtocolType) => {
    if (protocol.level === 1) {
      // Level 1 protocols execute immediately
      onActivateProtocol(protocol.name);
    } else {
      // Level 2 & 3 protocols need the executor modal
      setSelectedProtocol(protocol);
      setExecutorOpen(true);
    }
  };

  const handleProtocolExecute = (
    prompt: string,
    metadata?: Record<string, unknown>
  ) => {
    setIsProtocolExecuting(true);
    // Send the generated prompt to the chat interface
    onActivateProtocol(prompt);
  };

  const handleEditProtocol = (
    protocol: ProtocolType,
    event: React.MouseEvent
  ) => {
    event.stopPropagation(); // Prevent card click
    setEditingProtocol(protocol);
    setCreatorOpen(true);
  };

  const handleDeleteProtocol = async (
    protocol: ProtocolType,
    event: React.MouseEvent
  ) => {
    event.stopPropagation(); // Prevent card click

    if (
      window.confirm(
        `Are you sure you want to delete "${protocol.name}"? This action cannot be undone.`
      )
    ) {
      try {
        await deleteProtocolMutation.mutateAsync(protocol.id);

        toast({
          title: "Protocol Deleted",
          description: `${protocol.name} has been deleted successfully.`,
        });
      } catch (error) {
        // toast({
        //   title: "Error",
        //   description:
        //     error instanceof Error
        //       ? error.message
        //       : "Failed to delete protocol",
        //   variant: "destructive",
        // });
      }
    }
  };

  const handleProtocolUpdated = (protocol: ProtocolType) => {
    setEditingProtocol(null);
    setCreatorOpen(false);
  };

  const handleCreatorClose = () => {
    setEditingProtocol(null);
    setCreatorOpen(false);
  };

  const displayProtocols = React.useMemo(() => {
    if (!protocols) return [];
    return protocols.map((p) => ({
      ...p,
      ...(protocolDisplayMap[p.name] || {
        category: p.category || "General",
        icon: getLevelIcon(p.level),
      }),
    }));
  }, [protocols]);

  // Group protocols by level for better organization
  const protocolsByLevel = React.useMemo(() => {
    const grouped = displayProtocols.reduce((acc, protocol) => {
      const level = protocol.level;
      if (!acc[level]) acc[level] = [];
      acc[level].push(protocol);
      return acc;
    }, {} as Record<number, DisplayProtocolType[]>);

    // Sort each level by name
    Object.keys(grouped).forEach((level) => {
      grouped[parseInt(level)].sort((a, b) => a.name.localeCompare(b.name));
    });

    return grouped;
  }, [displayProtocols]);

  if (isLoadingProtocols || isLoadingSession) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="mt-2 text-sm text-muted-foreground">
          Loading system data...
        </p>
      </div>
    );
  }

  if (isErrorProtocols || isErrorSession) {
    return (
      <div className="p-4 text-destructive-foreground bg-destructive/10 rounded-lg">
        <div className="flex items-center mb-2">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <h4 className="font-semibold">Error Loading Data</h4>
        </div>
        {isErrorProtocols && (
          <p className="text-xs">
            Protocols: {errorProtocols?.message || "Unknown error"}
          </p>
        )}
        {isErrorSession && (
          <p className="text-xs">
            Session Data: {errorSession?.message || "Unknown error"}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-background text-foreground overflow-hidden">
      {/* Walkthrough injected
      <ProtocolWalkthrough
        run={runProtocol}
        setRun={setRunProtocol}
        userType={userType} //  send variable here
        onFinish={() => {
          setCreatorOpen(true);
          setTimeout(() => setRunModalWalkthrough(true), 500);
        }}
      /> */}

      <Tabs
        defaultValue={defaultTab}
        className="flex-1 flex flex-col h-full w-full px-2"
        onValueChange={handleTabChange}
      >
        <TabsList className="grid w-full grid-cols-2 flex-shrink-0 mb-2 glass-tabs font-ubuntu">
          <TabsTrigger value="protocols">Protocols</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="flex-1 flex flex-col mt-0 overflow-hidden ">
          <ScrollArea className="flex-1">
            <div className="p-2 glass-tabs">
              {sessionData && currentSessionId ? (
                <SessionTree
                  branchSessions={sessionData.branchSessions}
                  currentActiveSessionId={currentSessionId}
                />
              ) : (
                <div className="p-4">
                  <ListTree className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Session tasks will appear here.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent
          value="protocols"
          className="flex-1 flex flex-col mt-0 mx-3 mb-3 overflow-hidden"
        >
          <ScrollArea className="flex-1">
            <div className="space-y-4 pb-1 pr-4">
              {Object.keys(protocolsByLevel).length > 0 ? (
                Object.entries(protocolsByLevel)
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .map(([level, levelProtocols]) => (
                    <Collapsible
                      key={level}
                      open={!collapsedLevels.has(parseInt(level))}
                      onOpenChange={() => toggleLevel(parseInt(level))}
                    >
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center gap-2 px-2 py-1 hover:bg-muted/50 rounded-md cursor-pointer transition-colors">
                          <div className="flex items-center gap-2 flex-1">
                            <Badge
                              variant="outline"
                              className={`flex items-center gap-1 ${getLevelColor(
                                parseInt(level) as 1 | 2 | 3
                              )}`}
                            >
                              {React.createElement(
                                getLevelIcon(parseInt(level) as 1 | 2 | 3),
                                { className: "h-3 w-3 font-ubuntu" }
                              )}
                              Level {level} -{" "}
                              {getLevelName(parseInt(level) as 1 | 2 | 3)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {levelProtocols.length} protocol
                              {levelProtocols.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                          {collapsedLevels.has(parseInt(level)) ? (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent className="space-y-2 mt-2">
                        {[...levelProtocols]
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .map((protocol) => (
                            <motion.div
                              key={protocol.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                              whileHover={{ y: -2 }}
                            >
                              <Card
                                className="overflow-hidden transition-all cursor-pointer glass-tabss"
                                onClick={() => handleProtocolClick(protocol)}
                              >
                                <CardHeader className="p-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      {protocol.icon && (
                                        <protocol.icon className="h-4 w-4 text-primary/80" />
                                      )}
                                      <CardTitle className="text-sm font-medium">
                                        {protocol.name}
                                      </CardTitle>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {protocol.deliveredBy && (
                                        <Badge
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          {protocol.deliveredBy}
                                        </Badge>
                                      )}
                                      <Badge
                                        variant="outline"
                                        className={`text-xs ${getLevelColor(
                                          protocol.level
                                        )}`}
                                      >
                                        L{protocol.level}
                                      </Badge>
                                      {/* Only show edit/delete for user-created protocols */}
                                      {protocol.userId && (
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-6 w-6 p-0 hover:bg-muted"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              <MoreVertical className="h-3 w-3" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent
                                            align="end"
                                            className="w-32"
                                          >
                                            <DropdownMenuItem
                                              onClick={(e) =>
                                                handleEditProtocol(protocol, e)
                                              }
                                              className="cursor-pointer"
                                            >
                                              <Edit className="h-3 w-3 mr-2" />
                                              Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                              onClick={(e) =>
                                                handleDeleteProtocol(protocol, e)
                                              }
                                              className="cursor-pointer text-destructive focus:text-destructive"
                                            >
                                              <Trash2 className="h-3 w-3 mr-2" />
                                              Delete
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      )}
                                    </div>
                                  </div>
                                </CardHeader>
                                {protocol.description && (
                                  <CardContent className="p-3 pt-0">
                                    <CardDescription className="text-xs line-clamp-2">
                                      {protocol.description}
                                    </CardDescription>
                                    {protocol.level > 1 && (
                                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                        {protocol.inputs &&
                                          protocol.inputs.length > 0 && (
                                            <span>
                                              {protocol.inputs.length} input
                                              {protocol.inputs.length !== 1
                                                ? "s"
                                                : ""}
                                            </span>
                                          )}
                                        {protocol.modifiers &&
                                          protocol.modifiers.length > 0 && (
                                            <span>
                                              {protocol.modifiers.length} modifier
                                              {protocol.modifiers.length !== 1
                                                ? "s"
                                                : ""}
                                            </span>
                                          )}
                                        {protocol.level === 3 &&
                                          protocol.logic?.iterations?.enabled && (
                                            <span>Iterative</span>
                                          )}
                                        {protocol.level === 3 &&
                                          protocol.logic?.chaining?.enabled && (
                                            <span>Chained</span>
                                          )}
                                      </div>
                                    )}
                                  </CardContent>
                                )}
                              </Card>
                            </motion.div>
                          ))}
                      </CollapsibleContent>
                    </Collapsible>
                  ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    No protocols available.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Use the "Create Protocol" button below to get started.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Create Protocol Button - Fixed at bottom */}
          <div className="flex-shrink-0 py-2 pt-3 border-t border-border/20">
            <Button
              size="sm"
              id="create-protocol-btn"
              className="create-protocal w-full gap-2 bg-gradient-to-r from-indigo-500/80 to-purple-500/80 
    text-white font-medium shadow-[inset_1px_1px_6px_rgba(255,255,255,0.6),inset_-2px_-2px_6px_rgba(0,0,0,0.15)]
    hover:shadow-[0_0_12px_rgba(131,113,243,0.8),inset_1px_1px_6px_rgba(255,255,255,0.6)]
    border-[3px] border-white/50
    backdrop-blur-3xl"
              onClick={() => {
                setEditingProtocol(null);
                setCreatorOpen(true);
                localStorage.setItem("walkthroughStepIndex", "1");
              }}
            >
              <Plus className="h-4 w-4" />
              Create Protocol
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Protocol Creator Modal */}
      <ProtocolCreator
        open={creatorOpen}
        onOpenChange={setCreatorOpen}
        editingProtocol={editingProtocol}
        onProtocolCreated={
          editingProtocol ? handleProtocolUpdated : handleProtocolCreated
        }
        onClose={handleCreatorClose}
      />

      {/* Protocol Executor Modal */}
      {selectedProtocol && (
        <ProtocolExecutor
          protocol={selectedProtocol}
          open={executorOpen}
          onOpenChange={setExecutorOpen}
          onExecute={handleProtocolExecute}
        // isExecuting={isProtocolExecuting}
        />
      )}
    </div>
  );
};

export default ProtocolSystem;