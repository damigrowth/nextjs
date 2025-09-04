'use server';

import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';
import { ActionResult } from '@/lib/types/api';

interface OAuthSetupData {
  username: string;
  displayName?: string;
  role: string;
  type: string;
}

export async function completeOAuth(
  data: OAuthSetupData,
): Promise<ActionResult<{ success: boolean }>> {
  try {
    // console.log('=== SERVER ACTION: completeOAuth ===');
    // console.log('Update data:', data);

    // // Get current session to get user ID
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    // console.log('Current user ID:', session.user.id);

    // Determine the next step based on user type
    const nextStep = data.type === 'pro' ? 'ONBOARDING' : 'DASHBOARD';

    const updatedUser = await auth.api.updateUser({
      body: {
        username: data.username,
        displayName: data.displayName,
        role: data.role,
        type: data.type,
        step: nextStep,
        provider: 'google', // Ensure provider stays as 'google'
        confirmed: true, // Google OAuth users are now confirmed after setup
      },
      headers: await headers(),
    });

    // console.log('Updated Google OAuth user:', updatedUser, 'Next step:', nextStep);

    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    console.error('Error in completeOAuth:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user',
    };
  }
}
