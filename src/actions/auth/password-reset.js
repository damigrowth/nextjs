'use server';

import { postData } from '@/lib/client/operations';
import { RESET_PASSWORD } from '@/lib/graphql';

import { logout } from './logout';

/**
 * Server action to handle resetting the user's password using a reset code.
 * Calls the RESET_PASSWORD mutation with the new password and reset code.
 * Logs the user out if successful.
 *
 * @param {object} prevState - The previous state from useActionState.
 * @param {FormData} formData - The form data containing the new password, confirmation, and reset code.
 * @returns {Promise<{ success: boolean, message: string }>} Returns a state object indicating success or failure.
 */
export async function resetPassword(prevState, formData) {
  const password = formData.get('password');

  const passwordConfirmation = formData.get('passwordConfirmation');

  const resetCode = formData.get('resetCode');

  const response = await postData(RESET_PASSWORD, {
    password,
    passwordConfirmation,
    resetCode,
  });

  if (response.error?.includes('Λανθασμένος κωδικός επιβεβαίωσης')) {
    return {
      success: false,
      message:
        'Ο σύνδεσμος επαναφοράς έχει λήξει. Χρησιμοποιήστε νέο σύνδεσμο επαναφοράς κωδικού.',
    };
  }

  if (response?.data?.resetPassword?.jwt) {
    await logout();
  }

  return {
    success: true,
    message: 'Ο κωδικός σας άλλαξε με επιτυχία!',
  };
}
