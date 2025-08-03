'use server';

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { resetPasswordSchema } from '@/lib/validations/auth';
import { ActionResult } from '@/lib/types/api';
import { ResetPasswordInput } from '@/lib/validations/auth';

export async function resetPassword(
  prevState: any,
  formData: FormData,
): Promise<ActionResult<void>> {
  try {
    const token = formData.get('token') as string;
    const newPassword = formData.get('newPassword') as string;

    const validatedFields = resetPasswordSchema.safeParse({
      token,
      newPassword,
    });

    if (!validatedFields.success) {
      return {
        success: false,
        error: 'Invalid input data',
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { token: validatedToken, newPassword: validatedPassword } =
      validatedFields.data;

    // Use Better Auth to reset password
    const result = await auth.api.resetPassword({
      body: {
        token: validatedToken,
        newPassword: validatedPassword,
      },
    });

    if (!result) {
      return {
        success: false,
        error: 'Invalid or expired reset token',
      };
    }

    redirect('/login?message=password-reset-success');
  } catch (error: any) {
    console.error('Reset password error:', error);

    if (error.message?.includes('token')) {
      return {
        success: false,
        error: 'Invalid or expired reset token',
      };
    }

    return {
      success: false,
      error: 'Password reset failed. Please try again.',
    };
  }
}

/**
 * Reset password function for programmatic use
 */
export async function resetUserPassword(
  input: ResetPasswordInput,
): Promise<ActionResult<void>> {
  try {
    const validatedFields = resetPasswordSchema.safeParse(input);

    if (!validatedFields.success) {
      return {
        success: false,
        error: 'Invalid input',
      };
    }

    const { token, newPassword } = validatedFields.data;

    const result = await auth.api.resetPassword({
      body: {
        token,
        newPassword: newPassword,
      },
    });

    if (!result) {
      return {
        success: false,
        error: 'Invalid or expired reset token',
      };
    }

    return {
      success: true,
      data: undefined,
    };
  } catch (error: any) {
    console.error('Reset password error:', error);
    return {
      success: false,
      error: error.message || 'Password reset failed',
    };
  }
}
