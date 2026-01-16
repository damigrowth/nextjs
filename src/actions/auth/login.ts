'use server';

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { loginSchema } from '@/lib/validations/auth';
import { ActionResult, ActionResponse, ServerActionResponse } from '@/lib/types/api';
import { LoginInput } from '@/lib/validations/auth';
import { AuthUser } from '@/lib/types/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma/client';
import { getFormString } from '@/lib/utils/form';
import { createValidationErrorResponse } from '@/lib/utils/zod';
import { handleBetterAuthError } from '@/lib/utils/better-auth-error';

export async function login(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse & { data?: { user: AuthUser; redirectPath: string } }> {
  let user: AuthUser;

  try {
    const validatedFields = loginSchema.safeParse({
      identifier: getFormString(formData, 'identifier'),
      password: getFormString(formData, 'password'),
    });

    if (!validatedFields.success) {
      return createValidationErrorResponse(
        validatedFields.error,
        'Μη έγκυρα στοιχεία σύνδεσης',
      );
    }

    const { identifier, password } = validatedFields.data;

    // Validate that identifier is an email (Better Auth requires email)
    if (!identifier.includes('@')) {
      return {
        success: false,
        message: 'Παρακαλώ εισάγετε μια έγκυρη διεύθυνση email',
      };
    }

    // Use Better Auth to sign in
    const result = await auth.api.signInEmail({
      body: {
        email: identifier,
        password,
      },
      headers: await headers(),
    });

    if (!result.user) {
      return {
        success: false,
        message: 'Λάθος email ή κωδικός πρόσβασης',
      };
    }

    // Get complete user data from database (session might be null due to Better Auth limitation)
    const basicUser = result.user;
    const dbUser = await prisma.user.findUnique({
      where: { id: basicUser.id },
    });

    if (!dbUser) {
      return {
        success: false,
        message: 'Λογαριασμός δεν βρέθηκε',
      };
    }

    user = dbUser as AuthUser;

    if (user.blocked) {
      return {
        success: false,
        message: 'Ο λογαριασμός σας έχει αποκλειστεί',
      };
    }
  } catch (error: any) {
    // Use comprehensive Better Auth error handling
    return handleBetterAuthError(error);
  }

  // Return success with redirect path instead of redirecting
  let redirectPath = '/dashboard'; // default

  if (!user.emailVerified) {
    redirectPath = '/register/success';
  } else if (user.step === 'ONBOARDING') {
    redirectPath = '/onboarding';
  } else if (user.step === 'DASHBOARD') {
    // Redirect all admin roles (admin, support, editor) to /admin
    if (user.role === 'admin' || user.role === 'support' || user.role === 'editor') {
      redirectPath = '/admin';
    } else {
      redirectPath = '/dashboard';
    }
  } else {
    redirectPath = '/register/success';
  }

  return {
    success: true,
    message: 'Επιτυχής σύνδεση',
    data: {
      user,
      redirectPath,
    },
  };
}
