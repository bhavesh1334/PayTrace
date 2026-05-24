/**
 * src/utils/errorHandler.ts
 * Maps Firebase Auth / Firestore / Functions error codes to
 * human-readable, user-friendly messages for alerts and toasts.
 */

// ─── Firebase Auth error map ──────────────────────────────────────────────────

const AUTH_ERRORS: Record<string, string> = {
  // Sign-in
  'auth/user-not-found': 'No account found with this email. Please sign up first.',
  'auth/wrong-password': 'Incorrect password. Please try again or reset your password.',
  'auth/invalid-email': 'The email address is not valid.',
  'auth/user-disabled': 'This account has been disabled. Contact support.',
  'auth/too-many-requests': 'Too many failed attempts. Please wait a moment and try again.',
  'auth/invalid-credential': 'Your credentials are invalid or have expired. Please sign in again.',
  // Registration
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled.',
  // OAuth / Google
  'auth/account-exists-with-different-credential':
    'An account already exists with the same email but a different sign-in method.',
  'auth/popup-closed-by-user': 'Sign-in was cancelled.',
  'auth/cancelled-popup-request': 'Only one sign-in window can be open at a time.',
  // Network
  'auth/network-request-failed':
    'Network error. Check your internet connection and try again.',
  // Token
  'auth/id-token-expired': 'Your session has expired. Please sign in again.',
  'auth/id-token-revoked': 'Your session was revoked. Please sign in again.',
  // Generic
  'auth/internal-error': 'An unexpected error occurred. Please try again.',
};

// ─── Firestore error map ──────────────────────────────────────────────────────

const FIRESTORE_ERRORS: Record<string, string> = {
  'permission-denied': 'You don\'t have permission to perform this action.',
  'not-found': 'The requested data could not be found.',
  'already-exists': 'This record already exists.',
  'resource-exhausted': 'Service is temporarily busy. Please try again shortly.',
  'failed-precondition': 'Operation cannot be completed in the current state.',
  'aborted': 'Operation was aborted. Please retry.',
  'out-of-range': 'Invalid value provided.',
  'unimplemented': 'This feature is not yet available.',
  'internal': 'Internal server error. Our team has been notified.',
  'unavailable': 'Service temporarily unavailable. Check your connection.',
  'data-loss': 'Unexpected data loss. Please contact support.',
  'unauthenticated': 'Please sign in to continue.',
  'deadline-exceeded': 'Request timed out. Please try again.',
  'cancelled': 'Operation was cancelled.',
  'invalid-argument': 'Invalid data provided. Please check your inputs.',
};

// ─── Functions error map ──────────────────────────────────────────────────────

const FUNCTIONS_ERRORS: Record<string, string> = {
  'functions/cancelled': 'Operation was cancelled.',
  'functions/unknown': 'An unknown error occurred.',
  'functions/invalid-argument': 'Invalid data was provided to the server.',
  'functions/deadline-exceeded': 'The server took too long to respond.',
  'functions/not-found': 'The requested resource was not found.',
  'functions/already-exists': 'The resource already exists.',
  'functions/permission-denied': 'You don\'t have permission for this action.',
  'functions/resource-exhausted': 'Too many requests. Please slow down.',
  'functions/failed-precondition': 'Operation failed due to invalid state.',
  'functions/aborted': 'Operation was aborted. Please try again.',
  'functions/out-of-range': 'Value is out of the allowed range.',
  'functions/unimplemented': 'This feature is not yet implemented.',
  'functions/internal': 'Internal server error.',
  'functions/unavailable': 'Server is temporarily unavailable.',
  'functions/data-loss': 'Data loss occurred. Contact support.',
  'functions/unauthenticated': 'Please sign in to continue.',
};

// ─── Main resolver ────────────────────────────────────────────────────────────

/**
 * Convert any Firebase error (or generic JS error) into a friendly string.
 *
 * @param error   The caught error — can be a Firebase error object, a string, or anything.
 * @param context Optional context label shown as a prefix in dev mode.
 * @returns A human-readable error string safe to display in the UI.
 */
export function getReadableError(error: unknown, context?: string): string {
  if (!error) return 'An unexpected error occurred.';

  // Firebase errors expose a `code` property
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code: string }).code;

    // Auth
    if (code in AUTH_ERRORS) return AUTH_ERRORS[code];

    // Firestore — codes like "permission-denied" (no prefix)
    if (code in FIRESTORE_ERRORS) return FIRESTORE_ERRORS[code];

    // Functions — codes like "functions/permission-denied"
    if (code in FUNCTIONS_ERRORS) return FUNCTIONS_ERRORS[code];

    // Fallback with code
    return `Error (${code}). Please try again.`;
  }

  // Plain string error
  if (typeof error === 'string' && error.length > 0) return error;

  // Error instance with a message
  if (error instanceof Error && error.message) return error.message;

  return 'An unexpected error occurred. Please try again.';
}

// ─── Alert helper ─────────────────────────────────────────────────────────────

import { Alert } from 'react-native';

/**
 * Show a standard RN Alert with a friendly error message.
 *
 * @param error   The caught error
 * @param title   Alert title (default "Error")
 * @param context Optional context for dev logging
 */
export function showErrorAlert(
  error: unknown,
  title = 'Error',
  context?: string,
): void {
  if (__DEV__ && context) {
    console.warn(`[${context}]`, error);
  }
  const message = getReadableError(error, context);
  Alert.alert(title, message, [{ text: 'OK' }]);
}

// ─── Silent logger ────────────────────────────────────────────────────────────

/**
 * Log an error silently in dev; suppress in production.
 * Useful for non-critical background operations.
 */
export function logError(error: unknown, context?: string): void {
  if (__DEV__) {
    const prefix = context ? `[${context}] ` : '';
    console.error(`${prefix}`, error);
  }
}
