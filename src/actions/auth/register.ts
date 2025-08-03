'use server';

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { registerSchema } from '@/lib/validations/auth';
import { ActionResult, ActionResponse } from '@/lib/types/api';
import { RegisterInput } from '@/lib/validations/auth';
import { getFormString, getFormArray } from '@/lib/utils/form';
import { createValidationErrorResponse } from '@/lib/utils/zod';
import { handleBetterAuthError } from '@/lib/utils/better-auth-localization';

/**
 * Register action wrapper for useActionState
 */
export async function register(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    // Parse consent array with proper handling
    const consentArray = getFormArray(formData, 'consent', []);

    // Validate consent
    if (!consentArray.includes('terms')) {
      return {
        success: false,
        message: 'Πρέπει να αποδεχτείτε τους όρους χρήσης',
        errors: {
          consent: ['Πρέπει να αποδεχτείτε τους Όρους Χρήσης'],
        },
      };
    }

    // Determine user role
    const authType = getFormString(formData, 'authType');
    const role = getFormString(formData, 'role');
    let userRole = 'user';
    if (authType === '2') {
      userRole = role === '2' ? 'freelancer' : 'company';
    }

    // Get displayName - only for professionals, undefined for regular users
    const usernameValue = getFormString(formData, 'username');
    const displayNameValue =
      getFormString(formData, 'displayName') || usernameValue;

    const validatedFields = registerSchema.safeParse({
      email: getFormString(formData, 'email'),
      username: usernameValue,
      password: getFormString(formData, 'password'),
      displayName: displayNameValue,
      role: userRole,
      consent: true,
    });

    if (!validatedFields.success) {
      return createValidationErrorResponse(
        validatedFields.error,
        'Μη έγκυρα δεδομένα εγγραφής',
      );
    }

    const data = validatedFields.data;

    // Use Better Auth to create user
    const result = await auth.api.signUpEmail({
      body: {
        email: data.email,
        password: data.password,
        username: data.username,
        name: data.displayName,
        displayName: data.displayName,
        role: data.role,
      },
    });

    if (!result.user) {
      return {
        success: false,
        message: 'Αποτυχία εγγραφής. Παρακαλώ δοκιμάστε ξανά.',
      };
    }
  } catch (error: any) {
    // Use comprehensive Better Auth error handling
    return handleBetterAuthError(error);
  }

  // Server-side redirect like login action does (outside try/catch)
  redirect('/register/success');
}
