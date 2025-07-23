'use server';

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { confirmRegistrationSchema } from '@/lib/validations/auth';
import { ActionResult } from '@/lib/types/api';

export async function verifyEmail(prevState: any, formData: FormData): Promise<ActionResult<void>> {
  try {
    const token = formData.get('token') as string;

    const validatedFields = confirmRegistrationSchema.safeParse({ token });

    if (!validatedFields.success) {
      return {
        success: false,
        error: 'Invalid verification token',
      };
    }

    const { token: validatedToken } = validatedFields.data;

    // Use Better Auth to verify email
    const result = await auth.api.verifyEmail({
      body: {
        token: validatedToken,
      },
    });

    if (!result) {
      return {
        success: false,
        error: 'Invalid or expired verification token',
      };
    }

    // Redirect based on user role/step (handled by Better Auth hooks)
    redirect('/dashboard');

  } catch (error: any) {
    console.error('Email verification error:', error);
    
    if (error.message?.includes('token')) {
      return {
        success: false,
        error: 'Invalid or expired verification token',
      };
    }

    return {
      success: false,
      error: 'Email verification failed. Please try again.',
    };
  }
}

/**
 * Verify email with token (programmatic use)
 */
export async function verifyEmailWithToken(token: string): Promise<ActionResult<void>> {
  try {
    const validatedFields = confirmRegistrationSchema.safeParse({ token });

    if (!validatedFields.success) {
      return {
        success: false,
        error: 'Invalid token format',
      };
    }

    const result = await auth.api.verifyEmail({
      body: {
        token: validatedFields.data.token,
      },
    });

    if (!result) {
      return {
        success: false,
        error: 'Invalid or expired verification token',
      };
    }

    return {
      success: true,
      data: undefined,
    };
  } catch (error: any) {
    console.error('Email verification error:', error);
    return {
      success: false,
      error: error.message || 'Email verification failed',
    };
  }
}

/**
 * Resend email verification
 */
export async function resendEmailVerification(email: string): Promise<ActionResult<void>> {
  try {
    // Use Better Auth to resend verification email
    await auth.api.sendVerificationEmail({
      body: {
        email,
      },
    });

    return {
      success: true,
      data: undefined,
    };
  } catch (error: any) {
    console.error('Resend verification error:', error);
    
    // Always return success for security reasons
    return {
      success: true,
      data: undefined,
    };
  }
}