'use server';

import { auth } from '@/lib/auth';
import { forgotPasswordSchema } from '@/lib/validations/auth';
import { ActionResult } from '@/lib/types/api';
import { ForgotPasswordInput } from '@/lib/validations/auth';

export async function forgotPassword(prevState: any, formData: FormData): Promise<ActionResult<void>> {
  try {
    const email = formData.get('email') as string;

    const validatedFields = forgotPasswordSchema.safeParse({ email });

    if (!validatedFields.success) {
      return {
        success: false,
        error: 'Please enter a valid email address',
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { email: validatedEmail } = validatedFields.data;

    // Use Better Auth to send reset password email
    await auth.api.forgetPassword({
      body: {
        email: validatedEmail,
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
      },
    });

    return {
      success: true,
      data: undefined,
    };
  } catch (error: any) {
    console.error('Forgot password error:', error);
    
    // Don't expose if email exists or not for security
    return {
      success: true,
      data: undefined,
    };
  }
}

/**
 * Forgot password function for programmatic use
 */
export async function sendPasswordResetEmail(input: ForgotPasswordInput): Promise<ActionResult<void>> {
  try {
    const validatedFields = forgotPasswordSchema.safeParse(input);

    if (!validatedFields.success) {
      return {
        success: false,
        error: 'Invalid email address',
      };
    }

    const { email } = validatedFields.data;

    await auth.api.forgetPassword({
      body: {
        email,
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
      },
    });

    return {
      success: true,
      data: undefined,
    };
  } catch (error: any) {
    console.error('Send password reset error:', error);
    
    // Always return success for security reasons
    return {
      success: true,
      data: undefined,
    };
  }
}