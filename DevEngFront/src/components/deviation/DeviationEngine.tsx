import { useState, useEffect, useRef } from "react";
import CastSystem from "./CastSystem";
import ProtocolSystem from "./ProtocolSystem";
import { OperatorProfile } from "./OperatorProfile";
import { ChatInterface, ChatInterfaceHandle } from "../chat/ChatInterface";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useParams } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { ChevronDown, ChevronUp, ListChecks, FileText } from "lucide-react";
import { Button } from "../ui/button";
import { TaskProvider, useTasks } from "@/contexts/TaskContext";
import { TaskList } from "../tasks/TaskList";
import { TaskDetail } from "../tasks/TaskDetail";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { DocumentsView } from "../documents/DocumentsView";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "../ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { useSessionQuery } from "@/hooks/use-session";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useLayout } from "@/contexts/LayoutContext";

// Inner component that uses the useTasks hook
const DeviationEngineContent = () => {
  const { setShowBackground } = useLayout();
  const { projectId } = useParams<{ projectId: string }>();
  const [activeTab, setActiveTab] = useState("interact");
  const [isProtocolsOpen, setIsProtocolsOpen] = useState(false);
  const isMobile = useIsMobile();
  const { data: sessionData } = useSessionQuery(projectId);
  const [showTaskInput, setShowTaskInput] = useState(false);
  const { addTask } = useTasks();
  const { toast } = useToast();
  const chatInterfaceRef = useRef<ChatInterfaceHandle>(null);

  const [protocolPanelSize, setProtocolPanelSize] = useState(() => {
    if (projectId) {
      const savedSize = localStorage.getItem(`protocol-panel-size`);
      return savedSize ? parseInt(savedSize, 10) : 25;
    }
    return 25;
  });


    useEffect(() => {
    // Hide images when entering this component
    setShowBackground(false);

    // Show them again when leaving
    return () => setShowBackground(true);
  }, [setShowBackground]);
  
  const handlePanelResize = (sizes: number[]) => {
    if (projectId && sizes.length > 0) {
      setProtocolPanelSize(sizes[0]);
      localStorage.setItem(`protocol-panel-size`, sizes[0].toString());
    }
  };

  function Divider() {
    return (
      <div className="w-[100%] mx-auto my-2 border-[2px]  border-[#C6C5C5]/50 rounded-r-3xl" />
    )
  }

  const handleSendMessage = (
    content: string,
    selectedAgents: string[],
    taskTitle?: string
  ) => {
    // If a task title was provided, create a new task
    if (taskTitle) {
      const newTask = {
        id: `task-${Date.now()}`,
        name: taskTitle,
        description: content,
        status: "active" as const,
        createdAt: new Date(),
        associatedMessages: [],
        createdByProtocol: "begin",
        createdByAgent: selectedAgents[0] || "1", // Use first selected agent or default to Dax
      };

      addTask(newTask);

      toast({
        title: "Task Created",
        description: `New task "${newTask.name}" has been created.`,
      });
    }
  };

  // Handler to be passed to ProtocolSystem
  const handleActivateProtocolMessage = (protocolName: string) => {
    if (chatInterfaceRef.current) {
      chatInterfaceRef.current.handleProtocolActivation(protocolName);
    }
  };

  if (!projectId) {
    return <div>Project ID is required.</div>;
  }

  return (
    <div
      className={`h-screen flex flex-col  relative ${isMobile ? "" : "overflow-hidden"
        }`}
    >
      <div className="w-full">
        <h1 className={`${isMobile ? "text-xl py-[15px]" : "text-5xl py-[15px]"} font-semibold font-ubuntu text-color`}>
          {sessionData?.title}
        </h1>


      </div>
      {/* <div className="py-[15px] z-0" >

          <Divider />
        </div> */}
      <div
        className={`flex justify-between items-center ${isMobile ? "px-3 pt-3 pb-2" : "px-4"
          }`}
      >

        {isMobile ? (
          <div className="glass-tabs ">
            <ToggleGroup
              type="single"
              value={activeTab}
              onValueChange={(value) => value && setActiveTab(value)}
              className="p-2 "
            >
              <ToggleGroupItem
                value="interact"
                aria-label="Interact"
                className="px-3 py-1.5 text-xs data-[state=on]:bg-color data-[state=on]:text-color-b rounded-lg font-ubuntu "
              >
                Interact
              </ToggleGroupItem>
              <ToggleGroupItem
                value="cast"
                aria-label="Cast"
                className="px-2 py-1.5 text-xs data-[state=on]:bg-color data-[state=on]:text-color-b rounded-lg font-ubuntu"
              >
                Cast
              </ToggleGroupItem>
              <ToggleGroupItem
                value="profile"
                aria-label="Profile"
                className="px-2 py-1.5 text-xs data-[state=on]:bg-color data-[state=on]:text-color-b rounded-lg font-ubuntu"
              >
                Profile
              </ToggleGroupItem>
              <ToggleGroupItem
                value="documents"
                aria-label="Documents"
                className="px-2 py-1.5 text-xs data-[state=on]:bg-color data-[state=on]:text-color-b rounded-lg font-ubuntu"
              >
                Documents
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

        ) : (
          // Desktop tabs - keep as is
          <Tabs
            defaultValue={activeTab}
            value={activeTab}
            onValueChange={setActiveTab}
            className="max-w-[600px]"
          >
            <div className="glass-tabs mb-4">
              <TabsList className="grid grid-cols-4 h-11">
                <TabsTrigger
                  value="interact"
                  className="rounded-3xl font-medium font-ubuntu text-sm"
                >
                  Interact
                </TabsTrigger>
                <TabsTrigger
                  value="cast"
                  className="rounded-3xl font-medium font-ubuntu text-sm"
                >
                  Cast System
                </TabsTrigger>
                <TabsTrigger
                  value="profile"
                  className="rounded-3xl font-medium font-ubuntu text-sm"
                >
                  Operator Profile
                </TabsTrigger>
                <TabsTrigger
                  value="documents"
                  className="rounded-3xl font-medium font-ubuntu text-sm"
                >
                  Documents
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        )}
      </div>

      <div className={`flex-1 flex ${isMobile ? "" : "overflow-hidden"}`}>
        <div
          className={`w-full flex flex-col h-full ${isMobile ? "" : "overflow-hidden"
            }`}
        >
          <Tabs value={activeTab} className="flex-1 flex flex-col h-full">
            <TabsContent
              value="interact"
              className={`flex-1 h-full m-0 p-0 data-[state=active]:flex data-[state=active]:flex-col ${isMobile ? "" : ""
                }`}
            >
              <div className="flex h-full flex-col md:flex-row">
                {isMobile ? (
                  <div
                    className={`flex flex-col h-full ${isMobile ? "" : "overflow-hidden"
                      }`}
                  >
                    <div
                      className={`flex-1 ${isMobile ? "" : "overflow-auto"}`}
                    >
                      <ChatInterface
                        ref={chatInterfaceRef}
                        projectId={projectId}
                        hideTitleOnMobile={true}
                        onSendMessage={handleSendMessage}
                        showTaskInput={showTaskInput}
                        onCloseTaskInput={() => setShowTaskInput(false)}
                      />
                    </div>
                    <Accordion
                      type="single"
                      collapsible
                      className="w-full border-b border-border/30  "
                    >
                      <AccordionItem value="protocols" className="border-b-0 ">
                        <AccordionTrigger className="py-2 px-3 text-primary">
                          <span className="font-medium">Protocols</span>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-2">
                          <ProtocolSystem
                            currentSessionId={projectId}
                            onActivateProtocol={handleActivateProtocolMessage}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                  </div>
                ) : (
                  <ResizablePanelGroup
                    direction="horizontal"
                    className="h-full"
                    onLayout={handlePanelResize}
                  >
                    <ResizablePanel defaultSize={100 - protocolPanelSize}>
                      <ChatInterface
                        ref={chatInterfaceRef}
                        projectId={projectId}
                        onSendMessage={handleSendMessage}
                        showTaskInput={showTaskInput}
                        onCloseTaskInput={() => setShowTaskInput(false)}
                      />
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel
                      defaultSize={protocolPanelSize}
                      minSize={15}
                      maxSize={40}
                      className="border-r border-border/30 overflow-hidden h-full"
                    >
                      <div className="h-full">
                        <ProtocolSystem
                          currentSessionId={projectId}
                          onActivateProtocol={handleActivateProtocolMessage}
                        />
                      </div>
                    </ResizablePanel>
                  </ResizablePanelGroup>
                )}
              </div>
            </TabsContent>

            <TabsContent
              value="tasks"
              className={`flex-1 h-full m-0 data-[state=active]:flex data-[state=active]:flex-col ${isMobile ? "" : "overflow-auto"
                }`}
            >
              <div className="flex h-full flex-col md:flex-row p-4 gap-4">
                <div className="w-full md:w-1/3 mb-4 md:mb-0">
                  <TaskList />
                </div>
                <div className="w-full md:w-2/3">
                  <TaskDetail />
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="cast"
              className={`flex-1 h-full m-0 data-[state=active]:flex data-[state=active]:flex-col ${isMobile ? "" : "overflow-auto"
                }`}
            >
              <CastSystem sessionId={projectId} />
            </TabsContent>

            <TabsContent
              value="profile"
              className={`flex-1 h-full m-0 data-[state=active]:flex data-[state=active]:flex-col ${isMobile ? "" : "overflow-auto"
                }`}
            >
              <OperatorProfile />
            </TabsContent>

            <TabsContent
              value="documents"
              className={`flex-1 h-full m-0 data-[state=active]:flex data-[state=active]:flex-col ${isMobile ? "" : "overflow-auto"
                }`}
            >
              <DocumentsView projectId={projectId} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

// Main component that provides the TaskProvider
export function DeviationEngine() {
  const { projectId } = useParams<{ projectId: string }>();

  if (!projectId) {
    return <div>Project ID is required.</div>;
  }

  return (
    <TaskProvider projectId={projectId}>
      <DeviationEngineContent />
    </TaskProvider>
  );
}
