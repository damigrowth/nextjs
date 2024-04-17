// Functions for formatting input values
export const cutNumbers = (str) => {
  return str.replace(/[0-9]/g, "");
};

export const cutSymbols = (str) => {
  return str.replace(/[^\w\s]/g, "");
};

export const cutSpaces = (str) => {
  return str.replace(/\s/g, "");
};

export const capitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const restrictCapitalLetters = (str) => {
  return str.toLowerCase();
};
