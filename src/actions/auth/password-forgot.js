'use server';

import { postData } from '@/lib/client/operations';
import { FORGOT_PASSWORD } from '@/lib/graphql';

/**
 * Server action to handle the "forgot password" request.
 * Sends the user's email to the backend via the FORGOT_PASSWORD mutation.
 *
 * @param {object} prevState - The previous state from useActionState.
 * @param {FormData} formData - The form data containing the user's email.
 * @returns {Promise<{ success?: boolean, errors?: object, message: string }>} Returns a state object indicating success or failure.
 */
export async function forgotPassword(prevState, formData) {
  try {
    const email = formData.get('email');

    const result = await postData(FORGOT_PASSWORD, {
      email,
    });

    if (result.error) {
      return { message: result.error };
    }

    if (result.data?.forgotPassword?.ok) {
      return {
        success: true,
        errors: {},
        message:
          'Εάν το email υπάρχει στο σύστημά μας, θα λάβετε σύντομα ένα σύνδεσμο επαναφοράς κωδικού στο inbox σας.',
      };
    }
  } catch (error) {
    console.error(error);

    return {
      errors: {},
      message: 'Προέκυψε σφάλμα. Δοκιμάστε ξανά αργότερα.',
    };
  }
}
