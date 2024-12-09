import { format, register } from "timeago.js";
// Greek locale configuration
register("el", (number, index) => {
  return [
    ["μόλις τώρα", "σε λίγο"],
    ["πριν %s δευτερόλεπτα", "σε %s δευτερόλεπτα"],
    ["πριν 1 λεπτό", "σε 1 λεπτό"],
    ["πριν %s λεπτά", "σε %s λεπτά"],
    ["πριν 1 ώρα", "σε 1 ώρα"],
    ["πριν %s ώρες", "σε %s ώρες"],
    ["πριν 1 ημέρα", "σε 1 ημέρα"],
    ["πριν %s ημέρες", "σε %s ημέρες"],
    ["πριν 1 εβδομάδα", "σε 1 εβδομάδα"],
    ["πριν %s εβδομάδες", "σε %s εβδομάδες"],
    ["πριν 1 μήνα", "σε 1 μήνα"],
    ["πριν %s μήνες", "σε %s μήνες"],
    ["πριν 1 χρόνο", "σε 1 χρόνο"],
    ["πριν %s χρόνια", "σε %s χρόνια"],
  ][index];
});

/**
 * Formats a date to relative time in Greek
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted relative time string in Greek
 */
export const timeAgo = (date) => {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "";

    return format(dateObj, "el");
  } catch (error) {
    console.error("Error formatting Greek time:", error);
    return "";
  }
};
