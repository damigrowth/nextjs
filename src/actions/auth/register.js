'use server';

import { redirect } from 'next/navigation';

import { postData } from '@/lib/client/operations';
import { START_REGISTRATION } from '@/lib/graphql';

/**
 * Server action to handle the first step of user registration (startRegistration).
 * Sends user details (email, username, password, type, role, displayName) to the backend
 * via the START_REGISTRATION mutation. Redirects to /register/success on success.
 *
 * @param {object} prevState - The previous state from useActionState (not used here but required by the hook).
 * @param {FormData} formData - The form data containing registration details.
 * @returns {Promise<{ errors: object, message: string | null } | void>} Returns an error object or redirects.
 */
export async function register(prevState, formData) {
  const type = Number(formData.get('type'));

  const role = formData.get('role') ? Number(formData.get('role')) : null;

  const displayName = formData.get('displayName');

  const email = formData.get('email');

  const username = formData.get('username');

  const password = formData.get('password');

  const consent = formData.get('consent');

  if (!consent) {
    return {
      errors: {
        consent: ['Πρέπει να αποδεχθείς τους Όρους Χρήσης'],
      },
      message: null,
    };
  }

  // Call the START_REGISTRATION mutation
  const result = await postData(START_REGISTRATION, {
    input: {
      email: email,
      username: username,
      password: password,
      type: type,
      ...(type === 2 && { role: role, displayName: displayName }), // Only include role and displayName if type is 2 (Professional)
    },
  });

  // Handle potential GraphQL errors
  if (result.error) {
    console.error('GraphQL Error in register action:', result.error);

    return { errors: {}, message: result.error };
  }

  // Handle application-level errors from the mutation
  if (!result?.data?.startRegistration?.success) {
    console.error(
      'StartRegistration failed:',
      result?.data?.startRegistration?.message,
    );

    return {
      errors: {},
      message:
        result?.data?.startRegistration?.message ||
        'Η εγγραφή απέτυχε. Παρακαλώ δοκιμάστε ξανά.',
    };
  }

  redirect('/register/success');
}
