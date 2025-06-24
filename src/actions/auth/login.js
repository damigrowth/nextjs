'use server';

import { redirect } from 'next/navigation';
import { postData } from '@/lib/client/operations';
import { LOGIN_USER } from '@/lib/graphql';
import { loginSchema } from '../schema/login';
import { setToken } from './token';
import { getFreelancerActivationStatus } from '@/actions/shared/freelancer';

export async function login(prevState, formData) {
  const validatedFields = loginSchema.safeParse({
    identifier: formData.get('identifier'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Λάθος στοιχεία συνδεσης.',
    };
  }

  const { identifier, password } = validatedFields.data;

  // Don't wrap the redirect part in try/catch
  const response = await postData(LOGIN_USER, { identifier, password }, null);

  if (response?.data?.login?.jwt) {
    await setToken(response.data.login.jwt); // This now automatically calls revalidateTag('freelancer')

    const freelancer = await getFreelancerActivationStatus();

    // Direct redirect - Next.js handles the "error" internally
    if (freelancer?.isActive) {
      redirect('/dashboard');
    } else {
      redirect('/dashboard/start');
    }
  } else {
    return {
      success: false,
      errors: {},
      message: response?.error || 'Λάθος στοιχεία σύνδεσης.',
    };
  }
}
