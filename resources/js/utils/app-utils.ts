// -----------------------------------------------------------------------------
// Dates
// -----------------------------------------------------------------------------

/**
 * Parse a date string from Laravel (e.g. "2026-04-17 09:00:00") into a Date
 * treated as local time.  Handles ISO strings with "Z" suffix by stripping it,
 * and space-separated formats by replacing the space with "T".
 */
export function parseLaravelDate(dateStr: string): Date {
  const normalised = dateStr
    .replace(/\.000000Z$/, '')   // "2026-04-17T09:00:00.000000Z" → drop µs + Z
    .replace(/Z$/, '')           // any remaining trailing Z
    .replace(' ', 'T');          // "2026-04-17 09:00:00" → ISO-ish local
  return new Date(normalised);
}

/**
 * Extract just the YYYY-MM-DD portion from a Laravel date string without
 * going through Date (avoids any timezone shift).
 */
export function toDateKey(dateStr: string): string {
  return dateStr.slice(0, 10);
}

/** e.g. "Dec 26, 2025" */
export function formatShortDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** e.g. "Dec 26, 2025, 10:30 AM" */
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Hours remaining until 24 hours after `date` (0 if that moment has passed).
 */
export function hoursUntil(date: string | Date): number {
  const targetDate = new Date(date);
  targetDate.setHours(targetDate.getHours() + 24);
  const now = new Date();
  const diffInMs = targetDate.getTime() - now.getTime();
  const hours = Math.ceil(diffInMs / (1000 * 60 * 60));
  return Math.max(0, hours);
}

// -----------------------------------------------------------------------------
// Human-readable labels (snake_case → Title Case)
// -----------------------------------------------------------------------------

export function formatHumanLabel(
  value: string | null | undefined,
  fallback = ''
): string {
  const raw = String(value ?? fallback).replace(/_/g, ' ').trim();
  if (!raw) {
    return '';
  }
  return raw
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// -----------------------------------------------------------------------------
// Task due date (relative / overdue)
// -----------------------------------------------------------------------------

export interface DueDateDisplay {
  text: string;
  isOverdue: boolean;
  isToday: boolean;
}

/** Relative label for a task due date (Today, Tomorrow, overdue, or short date). */
export function getDueDateDisplay(
  date: string | null | undefined
): DueDateDisplay | null {
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
  }
  if (dueDate.getTime() === tomorrow.getTime()) {
    return { text: 'Tomorrow', isOverdue: false, isToday: false };
  }
  if (dueDate < today) {
    return {
      text: dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      isOverdue: true,
      isToday: false,
    };
  }
  return {
    text: dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    isOverdue: false,
    isToday: false,
  };
}

// -----------------------------------------------------------------------------
// Task status / priority — Tailwind (kanban cards, borders)
// -----------------------------------------------------------------------------

export function taskStatusSurfaceClasses(status: string | null | undefined): string {
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
}

export function taskPrioritySurfaceClasses(
  priority: string | null | undefined
): string {
  switch (priority) {
    case 'high':
      return 'border-destructive/10 dark:border-destructive/10 bg-destructive/5 dark:bg-destructive/10';
    default:
      return 'border-gray-200 dark:border-gray-700';
  }
}

export const STATUS_BADGE_COLORS: Record<string, string> = {
  todo: 'bg-slate-500/20 text-slate-700 dark:text-slate-300',
  in_progress: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
  done: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
};

export const PRIORITY_BADGE_COLORS: Record<string, string> = {
  low: 'bg-green-500/10 text-green-700 dark:text-green-400',
  medium: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  high: 'bg-destructive/10 text-destructive dark:bg-destructive/20',
};

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

// -----------------------------------------------------------------------------
// Calendar events — types & Tailwind maps
// -----------------------------------------------------------------------------

export type EventType = 'meeting' | 'deadline' | 'reminder' | 'call';

export const EVENT_TYPE_STYLES: Record<EventType, string> = {
  meeting:
    'bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-100 border-blue-300 dark:border-blue-800',
  deadline:
    'bg-red-100 dark:bg-red-950 text-red-900 dark:text-red-100 border-red-300 dark:border-red-800',
  reminder:
    'bg-yellow-100 dark:bg-yellow-950 text-yellow-900 dark:text-yellow-100 border-yellow-300 dark:border-yellow-800',
  call: 'bg-green-100 dark:bg-green-950 text-green-900 dark:text-green-100 border-green-300 dark:border-green-800',
};

export const EVENT_DOT_STYLES: Record<EventType, string> = {
  meeting: 'bg-blue-500 dark:bg-blue-400',
  deadline: 'bg-red-500 dark:bg-red-400',
  reminder: 'bg-yellow-500 dark:bg-yellow-400',
  call: 'bg-green-500 dark:bg-green-400',
};

export const EVENT_CARD_ACCENT: Record<EventType, string> = {
  meeting: 'border-l-blue-500 dark:border-l-blue-400',
  deadline: 'border-l-red-500 dark:border-l-red-400',
  reminder: 'border-l-yellow-500 dark:border-l-yellow-400',
  call: 'border-l-green-500 dark:border-l-green-400',
};

export const EVENT_TYPE_BADGE: Record<EventType, string> = {
  meeting: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
  deadline: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300',
  reminder: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300',
  call: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300',
};

export const EVENT_TYPE_ICON_COLOR: Record<EventType, string> = {
  meeting: 'text-blue-500 dark:text-blue-400',
  deadline: 'text-red-500 dark:text-red-400',
  reminder: 'text-yellow-500 dark:text-yellow-400',
  call: 'text-green-500 dark:text-green-400',
};

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  meeting: 'Meeting',
  deadline: 'Deadline',
  reminder: 'Reminder',
  call: 'Call',
};

export function formatFileSize(bytes?: number | string | null): string {
  const size = Number(bytes)
  if (!size || Number.isNaN(size)) return ''
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export function isImageFile(filetype?: string | null, filename?: string | null): boolean {
  if (filetype?.startsWith('image/')) return true
  return /\.(png|jpe?g|gif|webp|svg|bmp|avif)$/i.test(filename ?? '')
}

export const EVENT_LOCATION_LABELS: Record<string, string> = {
  office: 'Office',
  online: 'Online',
  other: 'Other',
};
