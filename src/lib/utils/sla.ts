/**
 * Centralized SLA Calculation Utility for TN HUB.
 * Calculates remaining working days (excluding Saturdays and Sundays) relative to a submission timestamp.
 */

export interface SLAResult {
  dueDate: Date;
  status: 'remaining' | 'due_today' | 'overdue' | 'resolved';
  days: number; // remaining or overdue days count
  label: string; // friendly display text (can be passed to i18n or directly displayed)
}

/**
 * Parses a variety of timestamp types (Firestore Timestamp, ISO String, Date) into a JS Date.
 */
export function parseDate(val: any): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof val.toDate === 'function') return val.toDate(); // Firestore Timestamp
  if (val.seconds !== undefined) return new Date(val.seconds * 1000); // Firestore-like object
  try {
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d;
  } catch {}
  return null;
}

/**
 * Adds N working days (excluding weekends) to a start date.
 */
export function addWorkingDays(startDate: Date, days: number): Date {
  const date = new Date(startDate.getTime());
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) { // 0 = Sunday, 6 = Saturday
      added++;
    }
  }
  return date;
}

/**
 * Calculates working days between two dates.
 */
export function getWorkingDaysBetween(startDate: Date, endDate: Date): number {
  const start = new Date(startDate.getTime());
  const end = new Date(endDate.getTime());
  
  // Set times to midnight to compare days
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  if (start.getTime() === end.getTime()) return 0;
  
  let count = 0;
  const isBackwards = start > end;
  const step = isBackwards ? -1 : 1;
  const current = new Date(start.getTime());

  while (current.getTime() !== end.getTime()) {
    current.setDate(current.getDate() + step);
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      count++;
    }
  }
  return count;
}

/**
 * Main function to calculate dynamic SLA.
 */
export function calculateSLA(
  submittedAtInput: any,
  slaThresholdDays: number,
  appStatus: string,
  nowInput: any = new Date()
): SLAResult | null {
  const submittedAt = parseDate(submittedAtInput);
  if (!submittedAt) return null;

  const now = parseDate(nowInput) || new Date();
  const dueDate = addWorkingDays(submittedAt, slaThresholdDays);

  // If application is in terminal state, it is resolved
  const isTerminal = ['APPROVED', 'ISSUED', 'COMPLETED', 'REJECTED'].includes(appStatus.toUpperCase());
  if (isTerminal) {
    return {
      dueDate,
      status: 'resolved',
      days: 0,
      label: 'Completed'
    };
  }

  const today = new Date(now.getTime());
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(dueDate.getTime());
  targetDate.setHours(0, 0, 0, 0);

  if (today.getTime() === targetDate.getTime()) {
    return {
      dueDate,
      status: 'due_today',
      days: 0,
      label: 'SLA Due Today'
    };
  }

  if (today > targetDate) {
    // Overdue
    const daysOverdue = getWorkingDaysBetween(targetDate, today);
    return {
      dueDate,
      status: 'overdue',
      days: daysOverdue,
      label: daysOverdue === 1 ? 'Overdue by 1 day' : `Overdue by ${daysOverdue} days`
    };
  } else {
    // Remaining
    const daysRemaining = getWorkingDaysBetween(today, targetDate);
    return {
      dueDate,
      status: 'remaining',
      days: daysRemaining,
      label: daysRemaining === 1 ? '1 day remaining' : `${daysRemaining} days remaining`
    };
  }
}
