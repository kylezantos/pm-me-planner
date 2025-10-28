import { startOfWeek, format } from 'date-fns';

/**
 * Get the Monday of the week containing the given date
 * @param date The date to find Monday for (defaults to today)
 * @returns Date object representing Monday of that week
 */
export function getMondayOfWeek(date: Date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

/**
 * Format month range for display
 * @param date Date in the month to format
 * @returns Formatted string like "January 2025"
 */
export function formatMonthRange(date: Date): string {
  return format(date, 'MMMM yyyy');
}

/**
 * Format day range for display
 * @param date Date to format
 * @returns Formatted string like "Monday, Jan 15, 2025"
 */
export function formatDayRange(date: Date): string {
  return format(date, 'EEEE, MMM d, yyyy');
}

/**
 * Format week range for display
 * @param weekStart First day (Monday) of the week
 * @param weekEnd Last day (Sunday) of the week
 * @returns Formatted string like "Jan 15 - 21, 2025" or "Jan 29 - Feb 4, 2025"
 */
export function formatWeekRange(weekStart: Date, weekEnd: Date): string {
  const sameMonth = weekStart.getMonth() === weekEnd.getMonth();

  if (sameMonth) {
    return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'd, yyyy')}`;
  }
  return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
}
