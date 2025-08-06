/**
 * BETTER AUTH GREEK LOCALIZATION
 * Greek translations for Better Auth error messages
 */

import { ActionResponse } from '@/lib/types/api';

/**
 * Greek translations for Better Auth error messages
 */
const EL_GR: Record<string, string> = {
  // User related errors
  USER_NOT_FOUND: 'Ο χρήστης δεν υπάρχει',
  FAILED_TO_CREATE_USER: 'Αποτυχία δημιουργίας χρήστη',
  FAILED_TO_UPDATE_USER: 'Αποτυχία ενημέρωσης χρήστη',
  USER_ALREADY_EXISTS: 'Ο χρήστης υπάρχει ήδη',
  USER_EMAIL_NOT_FOUND: 'Το email του χρήστη δεν βρέθηκε',
  USER_ALREADY_HAS_PASSWORD: 'Ο χρήστης έχει ήδη κωδικό',
  EMAIL_ALREADY_EXISTS: 'Το email δεν είναι διαθέσιμο',
  ACCOUNT_BLOCKED: 'Ο λογαριασμός έχει αποκλειστεί',

  // Session related errors
  FAILED_TO_CREATE_SESSION: 'Αποτυχία δημιουργίας συνεδρίας',
  FAILED_TO_GET_SESSION: 'Αποτυχία ανάκτησης συνεδρίας',
  SESSION_EXPIRED: 'Η συνεδρία έληξε',

  // Authentication errors
  INVALID_PASSWORD: 'Λάθος κωδικός',
  INVALID_EMAIL: 'Λάθος email',
  INVALID_EMAIL_OR_PASSWORD: 'Λάθος email ή κωδικός',
  INVALID_TOKEN: 'Λάθος token',
  EMAIL_NOT_VERIFIED: 'Το email δεν έχει επαληθευτεί',
  CREDENTIAL_ACCOUNT_NOT_FOUND: 'Δεν βρέθηκε ο λογαριασμός',

  // Password related errors
  PASSWORD_TOO_SHORT: 'Ο κωδικός είναι πολύ μικρός',
  PASSWORD_TOO_LONG: 'Ο κωδικός είναι πολύ μεγάλος',

  // Social auth errors
  SOCIAL_ACCOUNT_ALREADY_LINKED: 'Ο λογαριασμός κοινωνικού μέσου έχει συνδεθεί ήδη',
  PROVIDER_NOT_FOUND: 'Δεν βρέθηκε ο πάροχος',
  ID_TOKEN_NOT_SUPPORTED: 'Το id_token δεν υποστηρίζεται',
  FAILED_TO_GET_USER_INFO: 'Αποτυχία ανάκτησης πληροφοριών του χρήστη',

  // Account management errors
  EMAIL_CAN_NOT_BE_UPDATED: 'Το email δεν μπορεί να ενημερωθεί',
  FAILED_TO_UNLINK_LAST_ACCOUNT: 'Αποτυχία αποσύνδεσης του τελευταίου λογαριασμού',
  ACCOUNT_NOT_FOUND: 'Ο λογαριασμός δεν βρέθηκε',

  // Database/Server errors
  INTERNAL_ERROR: 'Σφάλμα διακομιστή',

  // Generic fallback
  UNKNOWN_ERROR: 'Παρουσιάστηκε σφάλμα. Παρακαλώ δοκιμάστε ξανά',
};

/**
 * Field mapping for specific error codes
 */
const FIELD_MAPPING: Record<string, string> = {
  // Email related
  INVALID_EMAIL: 'email',
  INVALID_EMAIL_OR_PASSWORD: 'email',
  USER_EMAIL_NOT_FOUND: 'email',
  EMAIL_NOT_VERIFIED: 'email',
  EMAIL_ALREADY_EXISTS: 'email',
  USER_ALREADY_EXISTS: 'email',
  EMAIL_CAN_NOT_BE_UPDATED: 'email',

  // Password related
  INVALID_PASSWORD: 'password',
  PASSWORD_TOO_SHORT: 'password',
  PASSWORD_TOO_LONG: 'password',
  USER_ALREADY_HAS_PASSWORD: 'password',

  // Token related
  INVALID_TOKEN: 'token',
  ID_TOKEN_NOT_SUPPORTED: 'token',

  // Account related
  ACCOUNT_NOT_FOUND: 'account',
  ACCOUNT_BLOCKED: 'account',
  CREDENTIAL_ACCOUNT_NOT_FOUND: 'account',
  SOCIAL_ACCOUNT_ALREADY_LINKED: 'account',
  FAILED_TO_UNLINK_LAST_ACCOUNT: 'account',
};

/**
 * Simple error pattern detection for Better Auth errors
 */
const ERROR_PATTERNS: Array<{ pattern: RegExp; code: string }> = [
  // User patterns
  { pattern: /user.*not.*found/i, code: 'USER_NOT_FOUND' },
  { pattern: /failed.*create.*user/i, code: 'FAILED_TO_CREATE_USER' },
  { pattern: /failed.*update.*user/i, code: 'FAILED_TO_UPDATE_USER' },
  { pattern: /user.*already.*exists/i, code: 'USER_ALREADY_EXISTS' },
  { pattern: /user.*already.*has.*password/i, code: 'USER_ALREADY_HAS_PASSWORD' },

  // Email patterns
  { pattern: /email.*already.*exists|duplicate.*email/i, code: 'EMAIL_ALREADY_EXISTS' },
  { pattern: /invalid.*email|email.*invalid/i, code: 'INVALID_EMAIL' },
  { pattern: /email.*not.*found/i, code: 'USER_EMAIL_NOT_FOUND' },
  { pattern: /email.*not.*verified/i, code: 'EMAIL_NOT_VERIFIED' },
  { pattern: /email.*can.*not.*be.*updated/i, code: 'EMAIL_CAN_NOT_BE_UPDATED' },

  // Session patterns
  { pattern: /failed.*create.*session/i, code: 'FAILED_TO_CREATE_SESSION' },
  { pattern: /failed.*get.*session/i, code: 'FAILED_TO_GET_SESSION' },
  { pattern: /session.*expired|expired.*session/i, code: 'SESSION_EXPIRED' },

  // Password patterns
  { pattern: /wrong.*password|incorrect.*password|invalid.*password/i, code: 'INVALID_PASSWORD' },
  { pattern: /invalid.*email.*or.*password/i, code: 'INVALID_EMAIL_OR_PASSWORD' },
  { pattern: /password.*too.*short|password.*minimum/i, code: 'PASSWORD_TOO_SHORT' },
  { pattern: /password.*too.*long|password.*maximum/i, code: 'PASSWORD_TOO_LONG' },

  // Token patterns
  { pattern: /invalid.*token/i, code: 'INVALID_TOKEN' },
  { pattern: /id.*token.*not.*supported/i, code: 'ID_TOKEN_NOT_SUPPORTED' },

  // Account patterns
  { pattern: /credential.*account.*not.*found/i, code: 'CREDENTIAL_ACCOUNT_NOT_FOUND' },
  { pattern: /account.*not.*found/i, code: 'ACCOUNT_NOT_FOUND' },
  { pattern: /account.*blocked|blocked.*account/i, code: 'ACCOUNT_BLOCKED' },

  // Social auth patterns
  { pattern: /social.*account.*already.*linked/i, code: 'SOCIAL_ACCOUNT_ALREADY_LINKED' },
  { pattern: /provider.*not.*found/i, code: 'PROVIDER_NOT_FOUND' },
  { pattern: /failed.*get.*user.*info/i, code: 'FAILED_TO_GET_USER_INFO' },
  { pattern: /failed.*unlink.*last.*account/i, code: 'FAILED_TO_UNLINK_LAST_ACCOUNT' },

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
