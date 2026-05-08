
import { useTasks } from "@/contexts/TaskContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, CheckCircle, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function TaskDetail() {
  const { activeTaskId, tasks } = useTasks();
  
  const task = tasks.find(t => t.id === activeTaskId);
  
  if (!task) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="text-muted-foreground">
          <p className="mb-2">No task selected</p>
          <p className="text-sm">Select a task from the list or use the "Begin" protocol to create a new task.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="pb-2 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium">{task.name}</h2>
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
          
          <p className="text-sm text-muted-foreground">{task.description}</p>
          
          <div className="flex gap-3 text-xs text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span>Created: {format(new Date(task.createdAt), 'MMM d, h:mm a')}</span>
            </div>
            {task.completedAt && (
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                <span>Completed: {format(new Date(task.completedAt), 'MMM d, h:mm a')}</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="outline">
              Started with: {task.createdByProtocol}
            </Badge>
            {task.completedByProtocol && (
              <Badge variant="outline">
                Completed with: {task.completedByProtocol}
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <Separator />
        
        <CardContent className="flex-1 overflow-auto pt-3">
          <div>
            <h3 className="text-sm font-medium mb-2">Associated Messages ({task.associatedMessages.length})</h3>
            {task.associatedMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No messages associated with this task yet.</p>
            ) : (
              <div className="text-sm text-muted-foreground">
                Message history will appear here. Currently showing message IDs for development:
                <ul className="list-disc pl-4 mt-1 text-xs">
                  {task.associatedMessages.map((messageId, index) => (
                    <li key={index}>{messageId}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
