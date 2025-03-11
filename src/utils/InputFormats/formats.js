// Functions for formatting input values
export const cutNumbers = (str) => {
  return str.replace(/[0-9]/g, "");
};

export const cutSymbols = (str) => {
  return str.replace(/[^\w\s\u0370-\u03FF]/g, "");
};

export const cutSpaces = (str) => {
  return str.replace(/\s/g, "");
};

export const capitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const restrictCapitalLetters = (str) => {
  return str.toLowerCase();
};

export const keepOnlyNumbers = (str) => {
  return str.toString().replace(/[^\d]/g, "");
};

export const formatInput = ({
  formatNumbers,
  formatSymbols,
  formatSpaces,
  capitalize,
  lowerCase,
  type,
  value,
  min,
  max,
  maxLength,
  minLength,
}) => {
  let formattedValue = value;

  if (type === "number" || type === "tel") {
    formattedValue = keepOnlyNumbers(formattedValue);

    // Enforce maxLength for number and tel inputs
    if (maxLength && formattedValue.length > maxLength) {
      formattedValue = formattedValue.substring(0, maxLength);
    }

    // For number inputs, convert to numeric type after length enforcement
    if (type === "number" && formattedValue !== "") {
      formattedValue = parseFloat(formattedValue);
    }
  }

  // Apply number formatting only if formatNumbers is true
  if (formatNumbers) {
    formattedValue = cutNumbers(formattedValue);
  }
  // Apply symbol formatting only if formatSymbols is true
  if (formatSymbols) {
    formattedValue = cutSymbols(formattedValue);
  }
  // Apply space formatting only if formatSpaces is true
  if (formatSpaces) {
    formattedValue = cutSpaces(formattedValue);
  }
  // Apply capitalization only if capitalize is true
  if (capitalize) {
    formattedValue = capitalizeFirstLetter(formattedValue);
  }
  // Apply lowercase restriction only if lowerCase is true
  if (lowerCase) {
    formattedValue = restrictCapitalLetters(formattedValue);
  }

  return formattedValue;
};
