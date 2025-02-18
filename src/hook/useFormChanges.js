import equal from "fast-deep-equal";

const normalizeValue = (value) => {
  // Handle null or undefined
  if (value === null || value === undefined) return null;

  // Convert numbers to strings for consistent comparison
  if (typeof value === "number") return String(value);

  // Handle File objects
  if (value instanceof File) {
    return {
      name: value.name,
      size: value.size,
      type: value.type,
    };
  }

  // Deep handling of objects
  if (typeof value === "object") {
    // Handle array of objects
    if (Array.isArray(value)) {
      return value
        .map((item) => {
          // For objects with nested structures
          if (typeof item === "object") {
            // Special handling for file-like objects
            if (item.file instanceof File) {
              return normalizeValue(item.file);
            }

            // Recursively normalize object
            if (Object.keys(item).length > 0) {
              const normalizedItem = {};
              Object.entries(item).forEach(([key, val]) => {
                const normalizedVal = normalizeValue(val);
                if (normalizedVal !== null) {
                  normalizedItem[key] = normalizedVal;
                }
              });
              return Object.keys(normalizedItem).length > 0
                ? normalizedItem
                : null;
            }

            // Extract ID or unique identifier
            return item.id || item.url || null;
          }
          return item;
        })
        .filter((item) => item !== null);
    }

    // Handle objects with a 'data' property
    if (value.data !== undefined) {
      // For array of objects
      if (Array.isArray(value.data)) {
        return normalizeValue(value.data);
      }

      // For single object
      return (
        value.data.id ||
        (value.data.attributes && value.data.attributes.id) ||
        normalizeValue(value.data)
      );
    }

    // Deep object traversal
    if (Object.keys(value).length > 0) {
      const normalizedObj = {};
      Object.entries(value).forEach(([key, val]) => {
        const normalizedVal = normalizeValue(val);
        // Only add non-null values
        if (normalizedVal !== null) {
          normalizedObj[key] = normalizedVal;
        }
      });
      return Object.keys(normalizedObj).length > 0 ? normalizedObj : null;
    }
  }

  // Trim strings
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  }

  return value;
};

export const useFormChanges = (currentState, originalState) => {
  if (typeof currentState !== "object" || typeof originalState !== "object") {
    console.error(
      "useFormChanges requires both currentState and originalState to be objects"
    );
    return { changes: {}, hasChanges: false };
  }

  const changes = Object.fromEntries(
    Object.entries(currentState).filter(([key, value]) => {
      const normalizedCurrent = normalizeValue(value);
      const normalizedOriginal = normalizeValue(originalState[key]);

      // Deep comparison using fast-deep-equal
      return !equal(normalizedCurrent, normalizedOriginal);
    })
  );

  const hasChanges = Object.keys(changes).length > 0;

  console.log("Current State", currentState);
  console.log("Original State", originalState);
  console.log("Changes", changes);
  console.log("Has Changes", hasChanges);

  return { changes, hasChanges };
};
