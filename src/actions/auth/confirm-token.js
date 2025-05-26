'use server';

import { postData } from '@/lib/client/operations';
import { COMPLETE_REGISTRATION } from '@/lib/graphql';

import { setToken } from './token';

/**
 * Server action to complete user registration by confirming an email token.
 * Calls the COMPLETE_REGISTRATION mutation with the provided token.
 * Sets the JWT token on success.
 *
 * @param {object} prevState - The previous state from useActionState.
 * @param {string} token - The email confirmation token from the URL.
 * @returns {Promise<{ success: boolean, message: string, redirect: boolean }>} Returns a state object indicating success or failure, and if a redirect should occur.
 */
export async function confirmTokenAction(prevState, token) {
  if (!token) {
    return {
      success: false,
      message: 'Missing confirmation token.',
      redirect: false,
    };
  }

  try {
    // Call the COMPLETE_REGISTRATION mutation
    const result = await postData(COMPLETE_REGISTRATION, {
      input: {
        token: token,
      },
    });

    // Handle potential GraphQL errors
    if (result.error) {
      return { success: false, message: result.error, redirect: false };
    }

    // Handle application-level errors from the mutation
    if (!result?.data?.completeRegistration?.success) {
      const errorMessage =
        result?.data?.completeRegistration?.message || 'Η επιβεβαίωση απέτυχε.';

      return {
        success: false,
        message: errorMessage,
        redirect: false,
      };
    }

    // Success case
    const { jwt } = result.data.completeRegistration;

    if (jwt) {
      await setToken(jwt); // Set the authentication token
    }

    const finalState = {
      success: true,
      message: `Επιτυχία εγγραφής!`,
      redirect: true,
    };

    return finalState;
  } catch (error) {
    // Catch unexpected errors during the process
    console.error('Unexpected error in confirmTokenAction:', error);

    return {
      success: false,
      message: 'An unexpected error occurred during confirmation.', // Generic message for unhandled errors
      redirect: false,
    };
  }
}
