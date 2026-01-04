/**
 * Formats a date to a short format (e.g., "Dec 26, 2025")
 */
export function formatShortDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Formats a date with time (e.g., "Dec 26, 2025, 10:30 AM")
 */
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
 * Calculates the hours remaining until 1 day (24 hours) after the given date
 * Returns the number of hours remaining (positive if in the future, 0 if already passed)
 */
export function hoursUntil(date: string | Date): number {
  const targetDate = new Date(date);
  targetDate.setHours(targetDate.getHours() + 24); // Add 1 day (24 hours)
  const now = new Date();
  const diffInMs = targetDate.getTime() - now.getTime();
  const hours = Math.ceil(diffInMs / (1000 * 60 * 60));
  return Math.max(0, hours); // Return 0 if negative (time has passed)
}

