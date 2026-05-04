export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const getYearOptions = (count = 5) => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: count }, (_, i) => currentYear - i);
};

/**
 * Returns true if the given month (1-12) and year combination is in the future
 * relative to the current month.
 */
export const isFutureMonth = (month, year) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-indexed
  if (year > currentYear) return true;
  if (year === currentYear && month > currentMonth) return true;
  return false;
};

/**
 * Returns today's date as a string in YYYY-MM-DD format.
 * Use as max attribute on date inputs to block future dates.
 */
export const todayString = () => new Date().toISOString().split("T")[0];

/**
 * Formats a date string as "January 2026"
 */
export const formatMonthYear = (dateStr) => {
  const d = new Date(dateStr);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

/**
 * Converts a month name and year to an ISO date string (1st of that month).
 * e.g. monthYearToISO("March", 2026) → "2026-03-01T00:00:00.000Z"
 */
export const monthYearToISO = (monthName, year) => {
  const monthIndex = MONTHS.indexOf(monthName);
  return new Date(parseInt(year), monthIndex, 1).toISOString().split("T")[0];
};
