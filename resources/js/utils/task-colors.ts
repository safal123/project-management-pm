export const getStatusColors = (status: string | null | undefined) => {
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

export const getPriorityColors = (priority: string | null | undefined) => {
  switch (priority) {
    case 'high':
      return 'border-red-200 dark:border-red-300 bg-red-50/10 dark:bg-red-950/10';
    // case 'medium':
    //   return 'border-amber-200 dark:border-amber-300';
    // case 'low':
    //   return 'border-blue-200 dark:border-blue-300';
    default:
      return 'border-gray-200 dark:border-gray-700';
  }
};

