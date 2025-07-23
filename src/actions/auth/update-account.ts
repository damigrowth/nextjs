'use server';

import { auth } from '@/lib/auth';
import { accountUpdateSchema, deleteAccountSchema } from '@/lib/validations/auth';
import { ActionResult } from '@/lib/types/api';
import { AccountUpdateInput, DeleteAccountInput } from '@/lib/validations/auth';
import { requireAuth } from './check-auth';
import { redirect } from 'next/navigation';

export async function updateAccount(prevState: any, formData: FormData): Promise<ActionResult<void>> {
  try {
    // Ensure user is authenticated
    const currentUser = await requireAuth();

    const displayName = formData.get('displayName') as string;

    const validatedFields = accountUpdateSchema.safeParse({ displayName });

    if (!validatedFields.success) {
      return {
        success: false,
        error: 'Invalid input data',
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { displayName: validatedDisplayName } = validatedFields.data;

    // Use Better Auth to update user
    const result = await auth.api.updateUser({
      body: {
        displayName: validatedDisplayName,
      },
    });

    if (!result) {
      return {
        success: false,
        error: 'Failed to update account',
      };
    }

    return {
      success: true,
      data: undefined,
    };
  } catch (error: any) {
    console.error('Update account error:', error);
    
    if (error.message === 'Authentication required') {
      return {
        success: false,
        error: 'You must be logged in to update your account',
      };
    }

    return {
      success: false,
      error: 'Account update failed. Please try again.',
    };
  }
}

/**
 * Update account function for programmatic use
 */
export async function updateUserAccount(input: AccountUpdateInput): Promise<ActionResult<any>> {
  try {
    const currentUser = await requireAuth();

    const validatedFields = accountUpdateSchema.safeParse(input);

    if (!validatedFields.success) {
      return {
        success: false,
        error: 'Invalid input',
      };
    }

    const { displayName } = validatedFields.data;

    const result = await auth.api.updateUser({
      body: {
        displayName,
      },
    });

    if (!result) {
      return {
        success: false,
        error: 'Failed to update account',
      };
    }

    return {
      success: true,
      data: result.user,
    };
  } catch (error: any) {
    console.error('Update account error:', error);
    return {
      success: false,
      error: error.message || 'Account update failed',
    };
  }
}

/**
 * Update user step (for onboarding flow)
 */
export async function updateUserStep(step: string): Promise<ActionResult<void>> {
  try {
    const currentUser = await requireAuth();

    // Use Better Auth admin API to update user step
    const result = await auth.api.updateUser({
      body: {
        step,
      },
    });

    if (!result) {
      return {
        success: false,
        error: 'Failed to update user step',
      };
    }

    return {
      success: true,
      data: undefined,
    };
  } catch (error: any) {
    console.error('Update user step error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update user step',
    };
  }
}

/**
 * Complete onboarding step
 */
export async function completeOnboarding(): Promise<ActionResult<void>> {
  try {
    const currentUser = await requireAuth();

    // Update user step to DASHBOARD
    const result = await updateUserStep('DASHBOARD');

    if (!result.success) {
      return result;
    }

    return {
      success: true,
      data: undefined,
    };
  } catch (error: any) {
    console.error('Complete onboarding error:', error);
    return {
      success: false,
      error: error.message || 'Failed to complete onboarding',
    };
  }
}

/**
 * Delete user account
 */
export async function deleteAccount(prevState: any, formData: FormData): Promise<ActionResult<void>> {
  try {
    const currentUser = await requireAuth();

    const username = formData.get('username') as string;
    const confirmUsername = formData.get('confirm-username') as string;

    // Verify username matches confirmation
    if (username !== confirmUsername) {
      return {
        success: false,
        error: 'Username confirmation does not match',
        fieldErrors: {
          confirmUsername: ['Username confirmation does not match'],
        },
      };
    }

    const validatedFields = deleteAccountSchema.safeParse({
      username,
      confirmUsername,
    });

    if (!validatedFields.success) {
      return {
        success: false,
        error: 'Invalid input data',
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    // Use Better Auth to delete account
    const result = await auth.api.deleteUser({
      body: {
        userId: currentUser.id,
      },
    });

    if (!result) {
      return {
        success: false,
        error: 'Account deletion failed',
      };
    }

    // Sign out user after deletion
    await auth.api.signOut({});

    // Redirect to home page
    redirect('/');

  } catch (error: any) {
    console.error('Delete account error:', error);

    if (error.message === 'Authentication required') {
      return {
        success: false,
        error: 'You must be logged in to delete your account',
      };
    }

    return {
      success: false,
      error: 'Account deletion failed. Please try again.',
    };
  }
}

/**
 * Delete account function for programmatic use
 */
export async function deleteUserAccount(input: DeleteAccountInput): Promise<ActionResult<void>> {
  try {
    const currentUser = await requireAuth();

    const validatedFields = deleteAccountSchema.safeParse(input);

    if (!validatedFields.success) {
      return {
        success: false,
        error: 'Invalid input',
      };
    }

    const { username, confirmUsername } = validatedFields.data;

    if (username !== confirmUsername) {
      return {
        success: false,
        error: 'Username confirmation does not match',
      };
    }

    const result = await auth.api.deleteUser({
      body: {
        userId: currentUser.id,
      },
    });

    if (!result) {
      return {
        success: false,
        error: 'Account deletion failed',
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Delete account error:', error);
    return {
      success: false,
      error: error.message || 'Account deletion failed',
    };
  }
}