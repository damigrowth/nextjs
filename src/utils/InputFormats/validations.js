export const validateInputFieldLength = (type, key, number, field, message) => {
  // Input Field Validation
  if (type === '>=' && key.length >= number) {
    return {
      errors: {
        field: field,
        active: true,
        message: message,
      },
    };
  }
  if (type === '>' && key.length > number) {
    return {
      errors: {
        field: field,
        active: true,
        message: message,
      },
    };
  }
  if (type === '=' && key.length === number) {
    return {
      errors: {
        field: field,
        active: true,
        message: message,
      },
    };
  }
  if (type === '<' && key.length < number) {
    return {
      errors: {
        field: field,
        active: true,
        message: message,
      },
    };
  }
  if (type === '<=' && key.length <= number) {
    return {
      errors: {
        field: field,
        active: true,
        message: message,
      },
    };
  }

  return null; // No errors
};
