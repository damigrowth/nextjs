/**
 * Formats a rating value to be displayed as a decimal
 * @param {number} value - The rating value.
 * @returns {string} - The rating formatted as a decimal (e.g. 4.5)
 */
export function formatRating(value) {
  const truncatedValue = Math.floor(value * 10) / 10;
  return truncatedValue.toFixed(1);
}

/**
 * Formats a user review rating to be displayed as a fraction (X/5)
 * @param {number} value - The user review rating value.
 * @returns {string} - The rating formatted as X/5
 */
export function formatUserRating(value) {
  // User ratings are always integers (1-5)
  const rating = Math.round(value);
  return `${rating}/5`;
}
