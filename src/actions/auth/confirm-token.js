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
      message: 'Λείπει το token επιβεβαίωσης.',
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
      console.error('GraphQL Error in confirmTokenAction:', result.error);
      return { 
        success: false, 
        message: result.error,
        redirect: false 
      };
    }

    // Handle application-level errors from the mutation
    if (!result?.data?.completeRegistration?.success) {
      const errorMessage =
        result?.data?.completeRegistration?.message || 'Η επιβεβαίωση απέτυχε.';

      console.error('Registration completion failed:', errorMessage);

      return {
        success: false,
        message: errorMessage,
        redirect: false,
      };
    }

    // Success case
    const { jwt, message, alreadyConfirmed } = result.data.completeRegistration;

    // Set the authentication token if we have one
    if (jwt) {
      await setToken(jwt);
    }

    // Determine the final message
    const finalMessage = message || 
      (alreadyConfirmed ? 'Το email σας έχει ήδη επιβεβαιωθεί!' : 'Επιτυχής επιβεβαίωση email!');

    const finalState = {
      success: true,
      message: finalMessage,
      redirect: true,
      alreadyConfirmed: alreadyConfirmed || false,
    };

    console.log('Email confirmation successful:', finalMessage);

    return finalState;
  } catch (error) {
    // Catch unexpected errors during the process
    console.error('Unexpected error in confirmTokenAction:', error);

    // Check for specific error types
    let errorMessage = 'Προέκυψε σφάλμα κατά την επιβεβαίωση.';
    
    if (error.message?.includes('network') || error.message?.includes('fetch')) {
      errorMessage = 'Πρόβλημα σύνδεσης. Παρακαλώ δοκιμάστε ξανά.';
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'Η αίτηση έλαβε timeout. Παρακαλώ δοκιμάστε ξανά.';
    }

    return {
      success: false,
      message: errorMessage,
      redirect: false,
    };
  }
}
