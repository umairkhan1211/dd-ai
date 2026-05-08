
import { useTasks } from "@/contexts/TaskContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

export function TaskList() {
  const { tasks, activeTaskId, setActiveTask } = useTasks();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'active') return task.status === 'active';
    if (filter === 'completed') return task.status === 'completed';
    return true;
  });

  const handleSelectTask = (taskId: string) => {
    setActiveTask(taskId);
  };
  
  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-medium mb-2">Tasks</h2>
      
      <Tabs defaultValue="all" value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full mb-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="flex-1 overflow-y-auto">
        {filteredTasks.length === 0 ? (
          <div className="text-center p-6 text-muted-foreground">
            No tasks found. Use the "Begin" protocol to create a new task.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map(task => (
              <motion.div 
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  className={`p-4 cursor-pointer border-l-4 hover:bg-muted/50 ${
                    task.id === activeTaskId 
                      ? 'border-l-primary bg-muted/30' 
                      : task.status === 'completed' 
                        ? 'border-l-green-500' 
                        : 'border-l-blue-500'
                  }`}
                  onClick={() => handleSelectTask(task.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{task.name}</h3>
                        <Badge variant={task.status === 'completed' ? "outline" : "default"} className={task.status === 'completed' ? "bg-green-100 text-green-800 border-green-300" : ""}>
                          {task.status === 'completed' ? (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 mr-1" /> Completed
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 mr-1" /> Active
                            </div>
                          )}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                    </div>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>Created: {format(new Date(task.createdAt), 'MMM d, h:mm a')}</span>
                    </div>
                    <div>
                      {task.associatedMessages.length} {task.associatedMessages.length === 1 ? 'message' : 'messages'}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
