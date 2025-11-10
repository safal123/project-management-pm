export const getStatusColors = (status: string) => {
  switch (status) {
    case 'done':
      return 'bg-green-50/10 dark:bg-green-950/10 border-green-300 dark:border-green-800';
    case 'in_progress':
      return 'bg-blue-50/10 dark:bg-blue-950/10 border-blue-300 dark:border-blue-800';
    case 'todo':
      return 'bg-gray-50/10 dark:bg-gray-950/10 border-gray-300 dark:border-gray-800';
    default:
      return 'bg-background border-border/50';
  }
};

export const getPriorityColors = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800';
    case 'medium':
      return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800';
    case 'low':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800';
    default:
      return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-300 dark:border-gray-800';
  }
};

