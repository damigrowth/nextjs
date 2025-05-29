'use server';

import { postData } from '@/lib/client/operations';
import { LOGIN_USER } from '@/lib/graphql';

import { loginSchema } from '../schema/login';
import { setToken } from './token';

/**
 * Server action to handle user login.
 * Validates identifier and password using loginSchema.
 * Calls the LOGIN_USER mutation. Sets the JWT token on success and redirects to the dashboard.
 *
 * @param {object} prevState - The previous state from useActionState.
 * @param {FormData} formData - The form data containing login credentials.
 * @returns {Promise<{ errors: object, message: string } | void>} Returns an error object or redirects.
 */
export async function login(prevState, formData) {
  const validatedFields = loginSchema.safeParse({
    identifier: formData.get('identifier'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Λάθος στοιχεία συνδεσης.',
    };
  }

  const { identifier, password } = validatedFields.data;

  const response = await postData(LOGIN_USER, {
    identifier,
    password,
  });

  if (response?.data?.login?.jwt) {
    await setToken(response.data.login.jwt);

    // Redirect to login page to trigger middleware check
    redirect('/login');
  } else {
    return {
      errors: {},
      message: response.error || 'Κάτι πήγε στραβά. Δοκιμάστε ξανά.',
    };
  }
}
