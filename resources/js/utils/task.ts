export interface DueDateInfo {
  text: string;
  isOverdue: boolean;
  isToday: boolean;
}

export function formatDueDate(date: string | null | undefined): DueDateInfo | null {
  if (!date) return null;

  const dueDate = new Date(date);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  if (dueDate.getTime() === today.getTime()) {
    return { text: 'Today', isOverdue: false, isToday: true };
  } else if (dueDate.getTime() === tomorrow.getTime()) {
    return { text: 'Tomorrow', isOverdue: false, isToday: false };
  } else if (dueDate < today) {
    return {
      text: dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      isOverdue: true,
      isToday: false
    };
  } else {
    return {
      text: dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      isOverdue: false,
      isToday: false
    };
  }
}

