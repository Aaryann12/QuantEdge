/**
 * Reusable Date Utility for QuantEdge
 * Ensures clear separation between:
 * 1. Last Trading Date (latest completed trading session, e.g., 07 Aug 2026)
 * 2. Prediction Target Date (next NSE trading session, e.g., 10 Aug 2026, skipping weekends/holidays)
 */

export const NSE_HOLIDAYS_2026 = [
  '2026-01-26', // Republic Day
  '2026-03-24', // Holi
  '2026-04-03', // Good Friday
  '2026-04-14', // Dr. Ambedkar Jayanti
  '2026-05-01', // Maharashtra Day
  '2026-08-15', // Independence Day
  '2026-10-02', // Mahatma Gandhi Jayanti
  '2026-10-20', // Dussehra
  '2026-11-09', // Diwali Laxmi Pujan
  '2026-12-25'  // Christmas
];

/**
 * Format a Date object or YYYY-MM-DD string into "DD MMM YYYY" (e.g. "10 Aug 2026")
 */
export function formatDisplayDate(dateInput) {
  if (!dateInput) return '10 Aug 2026';
  
  if (typeof dateInput === 'string') {
    // If already formatted like "07 Aug 2026", return directly
    if (/^\d{2}\s+[A-Za-z]{3}\s+\d{4}$/.test(dateInput.trim())) {
      return dateInput.trim();
    }
  }

  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return dateInput;

  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Calculates the next NSE trading session date after the given session date string/Date.
 * Skips Saturdays (6), Sundays (0), and NSE holidays.
 * For 07 Aug 2026 (Friday), returns "10 Aug 2026" (Monday).
 */
export function getNextTradingSessionDate(baseDateStr) {
  let baseDate;
  if (!baseDateStr) {
    baseDate = new Date(2026, 7, 7); // Default 07 Aug 2026
  } else if (typeof baseDateStr === 'string' && /^\d{2}\s+[A-Za-z]{3}\s+\d{4}$/.test(baseDateStr.trim())) {
    // Parse "07 Aug 2026"
    const parts = baseDateStr.trim().split(' ');
    const day = parseInt(parts[0], 10);
    const monthMap = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
    const month = monthMap[parts[1]] !== undefined ? monthMap[parts[1]] : 7;
    const year = parseInt(parts[2], 10);
    baseDate = new Date(year, month, day);
  } else {
    baseDate = new Date(baseDateStr);
  }

  if (isNaN(baseDate.getTime())) {
    baseDate = new Date(2026, 7, 7);
  }

  // Advance by 1 day at a time
  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + 1);

  while (true) {
    const dayOfWeek = nextDate.getDay(); // 0 = Sun, 6 = Sat
    const isoStr = nextDate.toISOString().split('T')[0];

    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = NSE_HOLIDAYS_2026.includes(isoStr);

    if (!isWeekend && !isHoliday) {
      break;
    }
    nextDate.setDate(nextDate.getDate() + 1);
  }

  return formatDisplayDate(nextDate);
}
