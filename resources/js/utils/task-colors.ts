// --- Card-level styles (borders/backgrounds for kanban cards, status selectors) ---

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
      return 'border-destructive/10 dark:border-destructive/10 bg-destructive/5 dark:bg-destructive/10';
    default:
      return 'border-gray-200 dark:border-gray-700';
  }
};

// --- Badge styles (compact colored badges for tables, dropdowns) ---

export const STATUS_BADGE_COLORS: Record<string, string> = {
  todo: 'bg-slate-500/20 text-slate-700 dark:text-slate-300',
  in_progress: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
  done: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
};

export const PRIORITY_BADGE_COLORS: Record<string, string> = {
  low: 'bg-green-500/10 text-green-700 dark:text-green-400',
  medium: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  high: 'bg-red-500/10 text-red-700 dark:text-red-400',
};

// --- Display labels ---

export const STATUS_LABELS: Record<string, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};
