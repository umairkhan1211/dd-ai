
import { createContext, useContext, useState, ReactNode } from "react";
import { TaskType } from "@/types/task";

interface TaskContextType {
  tasks: TaskType[];
  activeTaskId: string | null;
  setTasks: (tasks: TaskType[]) => void;
  addTask: (task: TaskType) => void;
  updateTask: (taskId: string, updates: Partial<TaskType>) => void;
  completeTask: (taskId: string, protocolId: string) => void;
  setActiveTask: (taskId: string | null) => void;
  getActiveTask: () => TaskType | null;
  addMessageToTask: (taskId: string, messageId: string) => void;
}

export const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children, projectId }: { children: ReactNode; projectId: string }) {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const addTask = (task: TaskType) => {
    setTasks(prev => [...prev, task]);
    setActiveTaskId(task.id);
  };

  const updateTask = (taskId: string, updates: Partial<TaskType>) => {
    setTasks(prev => 
      prev.map(task => task.id === taskId ? { ...task, ...updates } : task)
    );
  };

  const completeTask = (taskId: string, protocolId: string) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              status: 'completed', 
              completedAt: new Date(),
              completedByProtocol: protocolId
            } 
          : task
      )
    );
    
    if (activeTaskId === taskId) {
      setActiveTaskId(null);
    }
  };

  const setActiveTask = (taskId: string | null) => {
    setActiveTaskId(taskId);
  };

  const getActiveTask = (): TaskType | null => {
    return tasks.find(task => task.id === activeTaskId) || null;
  };

  const addMessageToTask = (taskId: string, messageId: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? {
              ...task,
              associatedMessages: [...task.associatedMessages, messageId]
            }
          : task
      )
    );
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      activeTaskId,
      setTasks,
      addTask,
      updateTask,
      completeTask,
      setActiveTask,
      getActiveTask,
      addMessageToTask
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
