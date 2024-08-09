/**
 * Truncates a number to the first decimal place and ensures it's displayed with one decimal place.
 * @param {number} value - The number to be truncated.
 * @returns {string} - The truncated number as a string with one decimal place.
 */

export function formatRating(value) {
  const truncatedValue = Math.floor(value * 10) / 10;
  return truncatedValue.toFixed(1);
}
