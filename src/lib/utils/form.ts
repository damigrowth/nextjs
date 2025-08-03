/**
 * FORM UTILITIES
 * Helper functions for form data handling and processing
 */

/**
 * Extract string value from FormData with optional default
 * Handles null/undefined values and provides type safety
 */
export function getFormString(formData: FormData, key: string, defaultValue = ''): string {
  return (formData.get(key) as string) || defaultValue;
}

/**
 * Extract number value from FormData with optional default
 * Converts string to number and handles invalid values
 */
export function getFormNumber(formData: FormData, key: string, defaultValue = 0): number {
  const value = formData.get(key) as string;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Extract integer value from FormData with optional default
 * Converts string to integer and handles invalid values
 */
export function getFormInt(formData: FormData, key: string, defaultValue = 0): number {
  const value = formData.get(key) as string;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Extract boolean value from FormData
 * Handles various truthy representations
 */
export function getFormBoolean(formData: FormData, key: string, defaultValue = false): boolean {
  const value = formData.get(key) as string;
  if (!value) return defaultValue;
  
  return ['true', '1', 'on', 'yes'].includes(value.toLowerCase());
}

/**
 * Extract and parse JSON value from FormData
 * Safely handles JSON parsing with fallback
 */
export function getFormJSON<T>(formData: FormData, key: string, defaultValue: T): T {
  const value = formData.get(key) as string;
  if (!value) return defaultValue;
  
  try {
    return JSON.parse(value);
  } catch {
    return defaultValue;
  }
}

/**
 * Extract array value from FormData (JSON or comma-separated)
 * Handles both JSON arrays and comma-separated strings
 */
export function getFormArray(formData: FormData, key: string, defaultValue: string[] = []): string[] {
  const value = formData.get(key) as string;
  if (!value) return defaultValue;
  
  // Try JSON parsing first
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : defaultValue;
  } catch {
    // Fallback to comma-separated string
    return value.split(',').map(item => item.trim()).filter(Boolean);
  }
}

/**
 * Extract multiple values for the same key from FormData
 * Useful for checkboxes or multi-select inputs
 */
export function getFormMultiple(formData: FormData, key: string): string[] {
  return formData.getAll(key) as string[];
}

/**
 * Type-safe FormData extraction with validation
 * Extracts all values at once with proper typing
 */
export function extractFormData<T extends Record<string, any>>(
  formData: FormData,
  schema: {
    [K in keyof T]: {
      type: 'string' | 'number' | 'int' | 'boolean' | 'json' | 'array';
      defaultValue?: T[K];
      required?: boolean;
    }
  }
): { data: T; errors: Record<string, string> } {
  const data = {} as T;
  const errors: Record<string, string> = {};

  for (const [key, config] of Object.entries(schema)) {
    try {
      let value: any;
      
      switch (config.type) {
        case 'string':
          value = getFormString(formData, key, config.defaultValue || '');
          break;
        case 'number':
          value = getFormNumber(formData, key, config.defaultValue || 0);
          break;
        case 'int':
          value = getFormInt(formData, key, config.defaultValue || 0);
          break;
        case 'boolean':
          value = getFormBoolean(formData, key, config.defaultValue || false);
          break;
        case 'json':
          value = getFormJSON(formData, key, config.defaultValue);
          break;
        case 'array':
          value = getFormArray(formData, key, config.defaultValue || []);
          break;
        default:
          value = getFormString(formData, key, config.defaultValue || '');
      }

      // Check required fields
      if (config.required && (!value || (Array.isArray(value) && value.length === 0))) {
        errors[key] = `${key} is required`;
      } else {
        data[key as keyof T] = value;
      }
    } catch (error) {
      errors[key] = `Invalid ${key} format`;
    }
  }

  return { data, errors };
}