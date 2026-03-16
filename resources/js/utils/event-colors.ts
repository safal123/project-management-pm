export type EventType = 'meeting' | 'deadline' | 'reminder' | 'call';

// Full-background styles for calendar cell pills
export const EVENT_TYPE_STYLES: Record<EventType, string> = {
  meeting: 'bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-100 border-blue-300 dark:border-blue-800',
  deadline: 'bg-red-100 dark:bg-red-950 text-red-900 dark:text-red-100 border-red-300 dark:border-red-800',
  reminder: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-900 dark:text-yellow-100 border-yellow-300 dark:border-yellow-800',
  call: 'bg-green-100 dark:bg-green-950 text-green-900 dark:text-green-100 border-green-300 dark:border-green-800',
};

// Dot indicator colors for legend
export const EVENT_DOT_STYLES: Record<EventType, string> = {
  meeting: 'bg-blue-500 dark:bg-blue-400',
  deadline: 'bg-red-500 dark:bg-red-400',
  reminder: 'bg-yellow-500 dark:bg-yellow-400',
  call: 'bg-green-500 dark:bg-green-400',
};

// Left-border accent styles for event detail cards
export const EVENT_CARD_ACCENT: Record<EventType, string> = {
  meeting: 'border-l-blue-500 dark:border-l-blue-400',
  deadline: 'border-l-red-500 dark:border-l-red-400',
  reminder: 'border-l-yellow-500 dark:border-l-yellow-400',
  call: 'border-l-green-500 dark:border-l-green-400',
};

// Subtle badge styles for event type labels
export const EVENT_TYPE_BADGE: Record<EventType, string> = {
  meeting: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
  deadline: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300',
  reminder: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300',
  call: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300',
};

// Icon text color for event type
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

export const EVENT_LOCATION_LABELS: Record<string, string> = {
  office: 'Office',
  online: 'Online',
  other: 'Other',
};
