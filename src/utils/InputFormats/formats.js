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

// Changed function to allow English letters, numbers, hyphens, and underscores
export const formatUsername = (str) => {
  return str.replace(/[^a-zA-Z0-9_-]/g, "");
};

export const formatInput = ({
  formatNumbers,
  formatSymbols,
  formatSpaces,
  capitalize,
  lowerCase,
  englishOnly,
  usernameFormat,
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

    // For number inputs, keep as string if empty, otherwise parse
    // This allows the InputB component to handle empty state correctly on change/blur
    if (type === "number" && formattedValue !== "") {
      // We don't parseFloat here anymore, InputB's onBlur will handle final numeric conversion/validation
      // formattedValue = parseFloat(formattedValue); // Removed parseFloat here
    } else if (type === "number" && formattedValue === "") {
      // Explicitly return empty string if formatting resulted in empty
      return "";
    }
  }

  // Apply username format first if specified
  if (usernameFormat) {
    formattedValue = formatUsername(formattedValue);
  }
  // Apply English-only filter if specified (maintaining backward compatibility)
  else if (englishOnly) {
    formattedValue = formatUsername(formattedValue);
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
