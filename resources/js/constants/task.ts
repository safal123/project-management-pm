// Task Status Constants
export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
} as const;

export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];

// Task Priority Constants
export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export type TaskPriority = typeof TASK_PRIORITY[keyof typeof TASK_PRIORITY];

// Helper functions to get all options
export const getTaskStatusOptions = (): TaskStatus[] => {
  return Object.values(TASK_STATUS);
};

export const getTaskPriorityOptions = (): TaskPriority[] => {
  return Object.values(TASK_PRIORITY);
};

