import { format } from "date-fns";

/**
 * Formats a given date string to 'dd MMMM yyyy'.
 * @param {string} dateStr - The date string to format.
 * @returns {string} - The formatted date string.
 */
export const formatDate = (dateStr, type) => {
  const date = new Date(dateStr);
  const formattedDate = format(date, type);
  return { formattedDate };
};
