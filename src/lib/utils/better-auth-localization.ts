/**
 * BETTER AUTH GREEK LOCALIZATION
 * Greek translations for Better Auth error messages
 */

import { ActionResponse } from '@/lib/types/api';

/**
 * Greek translations for Better Auth error messages
 */
const EL_GR: Record<string, string> = {
  // Authentication errors
  INVALID_EMAIL: 'Μη έγκυρο email',
  INVALID_PASSWORD: 'Μη έγκυρος κωδικός',
  INVALID_EMAIL_OR_PASSWORD: 'Μη έγκυρο email ή κωδικός',
  INVALID_TOKEN: 'Μη έγκυρο token',

  // User related errors
  USER_NOT_FOUND: 'Ο χρήστης δεν βρέθηκε',
  USER_ALREADY_EXISTS: 'Ο χρήστης υπάρχει ήδη',
  EMAIL_ALREADY_EXISTS: 'Το email δεν είναι διαθέσιμο',
  USER_EMAIL_NOT_FOUND: 'Το email του χρήστη δεν βρέθηκε',
  EMAIL_NOT_VERIFIED: 'Το email δεν έχει επαληθευτεί',
  ACCOUNT_NOT_FOUND: 'Ο λογαριασμός δεν βρέθηκε',
  ACCOUNT_BLOCKED: 'Ο λογαριασμός έχει αποκλειστεί',

  // Password related errors
  PASSWORD_TOO_SHORT: 'Ο κωδικός είναι πολύ μικρός',
  PASSWORD_TOO_LONG: 'Ο κωδικός είναι πολύ μεγάλος',

  // Session related errors
  SESSION_EXPIRED: 'Η συνεδρία έχει λήξει. Συνδεθείτε ξανά για να συνεχίσετε.',

  // Database/Server errors
  FAILED_TO_CREATE_USER: 'Αποτυχία δημιουργίας χρήστη',
  FAILED_TO_UPDATE_USER: 'Αποτυχία ενημέρωσης χρήστη',
  INTERNAL_ERROR: 'Σφάλμα διακομιστή',

  // Generic fallback
  UNKNOWN_ERROR: 'Παρουσιάστηκε σφάλμα. Παρακαλώ δοκιμάστε ξανά',
};

/**
 * Field mapping for specific error codes
 */
const FIELD_MAPPING: Record<string, string> = {
  INVALID_EMAIL: 'email',
  INVALID_EMAIL_OR_PASSWORD: 'email',
  USER_EMAIL_NOT_FOUND: 'email',
  EMAIL_NOT_VERIFIED: 'email',
  EMAIL_ALREADY_EXISTS: 'email',
  USER_ALREADY_EXISTS: 'email',

  INVALID_PASSWORD: 'password',
  PASSWORD_TOO_SHORT: 'password',
  PASSWORD_TOO_LONG: 'password',

  INVALID_TOKEN: 'token',
};

/**
 * Simple error pattern detection for Better Auth errors
 */
const ERROR_PATTERNS: Array<{ pattern: RegExp; code: string }> = [
  // Email patterns
  {
    pattern: /user already exists|email.*already.*exists|duplicate.*email/i,
    code: 'EMAIL_ALREADY_EXISTS',
  },
  { pattern: /invalid.*email|email.*invalid/i, code: 'INVALID_EMAIL' },
  {
    pattern: /email.*not.*found|user.*not.*found/i,
    code: 'USER_EMAIL_NOT_FOUND',
  },
  { pattern: /email.*not.*verified/i, code: 'EMAIL_NOT_VERIFIED' },

  // Password patterns
  {
    pattern: /wrong.*password|incorrect.*password|invalid.*password/i,
    code: 'INVALID_PASSWORD',
  },
  {
    pattern: /password.*too.*short|password.*minimum/i,
    code: 'PASSWORD_TOO_SHORT',
  },
  {
    pattern: /password.*too.*long|password.*maximum/i,
    code: 'PASSWORD_TOO_LONG',
  },

  // Account patterns
  { pattern: /account.*not.*found/i, code: 'ACCOUNT_NOT_FOUND' },
  { pattern: /account.*blocked|blocked.*account/i, code: 'ACCOUNT_BLOCKED' },

  // Session patterns
  { pattern: /session.*expired|expired.*session/i, code: 'SESSION_EXPIRED' },

  // Generic patterns
  { pattern: /internal.*error|server.*error/i, code: 'INTERNAL_ERROR' },
];

/**
 * Detect error code from Better Auth error
 */
function detectErrorCode(error: any): string {
  // First check if Better Auth provides a direct error code
  if (error?.code && EL_GR[error.code]) {
    return error.code;
  }

  // Then check the error body for code
  if (error?.body?.code && EL_GR[error.body.code]) {
    return error.body.code;
  }

  // Fallback to message pattern matching
  const errorMessage = error?.message || '';
  for (const { pattern, code } of ERROR_PATTERNS) {
    if (pattern.test(errorMessage)) {
      return code;
    }
  }

  return 'UNKNOWN_ERROR';
}

/**
 * Translate Better Auth error to Greek
 */
export function translateBetterAuthError(error: any): {
  message: string;
  field?: string;
  fieldMessage?: string;
} {
  const errorCode = detectErrorCode(error);
  const translation = EL_GR[errorCode];
  const field = FIELD_MAPPING[errorCode];

  if (translation) {
    return {
      message: translation,
      field: field,
      fieldMessage: translation,
    };
  }

  // Fallback
  return {
    message: EL_GR.UNKNOWN_ERROR,
  };
}

/**
 * Create ActionResponse from Better Auth error with Greek translation
 */
export function handleBetterAuthError(error: any): ActionResponse {
  console.error('Better Auth error:', error);
  console.error('Better Auth error:', error?.body);

  const translation = translateBetterAuthError(error);

  const response: ActionResponse = {
    success: false,
    message: translation.message,
  };

  // Add field-specific error if available
  if (translation.field && translation.fieldMessage) {
    response.errors = {
      [translation.field]: [translation.fieldMessage],
    };
  }

  return response;
}
