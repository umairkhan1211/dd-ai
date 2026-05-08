
export type TaskStatus = 'active' | 'completed' | 'locked';

export interface TaskType {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  createdAt: Date;
  completedAt?: Date;
  associatedMessages: string[];
  createdByProtocol: string;
  createdByAgent?: string;
  completedByProtocol?: string;
}
