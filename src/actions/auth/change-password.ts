'use server';

import { auth } from '@/lib/auth';
import { passwordChangeSchema } from '@/lib/validations/auth';
import { ActionResult } from '@/lib/types/api';
import { PasswordChangeInput } from '@/lib/validations/auth';

export async function changePassword(prevState: any, formData: FormData): Promise<ActionResult<void>> {
  try {
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    const validatedFields = passwordChangeSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!validatedFields.success) {
      return {
        success: false,
        error: 'Invalid input data',
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { currentPassword: oldPassword, newPassword: validatedNewPassword } = validatedFields.data;

    // Get current session to identify the user
    const session = await auth.api.getSession({
      headers: {
        // Better Auth will handle getting the session from cookies
      }
    });

    if (!session?.user) {
      return {
        success: false,
        error: 'You must be logged in to change your password',
      };
    }

    // Use Better Auth to change password
    const result = await auth.api.changePassword({
      body: {
        currentPassword: oldPassword,
        newPassword: validatedNewPassword,
      },
    });

    if (!result) {
      return {
        success: false,
        error: 'Current password is incorrect',
      };
    }

    return {
      success: true,
      data: undefined,
    };
  } catch (error: any) {
    console.error('Change password error:', error);
    
    if (error.message?.includes('current password')) {
      return {
        success: false,
        error: 'Current password is incorrect',
      };
    }

    return {
      success: false,
      error: 'Password change failed. Please try again.',
    };
  }
}

/**
 * Change password function for programmatic use
 */
export async function updateUserPassword(input: PasswordChangeInput): Promise<ActionResult<void>> {
  try {
    const validatedFields = passwordChangeSchema.safeParse(input);

    if (!validatedFields.success) {
      return {
        success: false,
        error: 'Invalid input',
      };
    }

    const { currentPassword, newPassword } = validatedFields.data;

    const result = await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
      },
    });

    if (!result) {
      return {
        success: false,
        error: 'Current password is incorrect',
      };
    }

    return {
      success: true,
      data: undefined,
    };
  } catch (error: any) {
    console.error('Update password error:', error);
    return {
      success: false,
      error: error.message || 'Password update failed',
    };
  }
}