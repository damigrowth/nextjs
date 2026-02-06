'use server';

import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';
import { getFormString } from '@/lib/utils/form';
import { handleBetterAuthError } from '@/lib/utils/better-auth-error';
import { ActionResponse } from '@/lib/types/api';
import { brevoWorkflowService } from '@/lib/email';
import { UserRole, UserType, JourneyStep } from '@prisma/client';

export async function completeOAuth(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    // Extract form data
    const username = getFormString(formData, 'username');
    const displayName = getFormString(formData, 'displayName');
    const role = getFormString(formData, 'role');
    const type = getFormString(formData, 'type');

    // Get current session to get user ID
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        success: false,
        message: 'Ο χρήστης δεν είναι συνδεδεμένος',
      };
    }

    // Check if username is already taken
    const usernameCheck = await auth.api.isUsernameAvailable({
      body: { username },
    });

    if (!usernameCheck?.available) {
      return {
        success: false,
        message: 'Το συγκεκριμένο username χρησιμοποιείται ήδη. Επιλέξτε ένα διαφορετικό username.',
      };
    }

    // Determine the next step based on user type
    const nextStep = type === 'pro' ? 'ONBOARDING' : 'DASHBOARD';

    // Get existing user image to preserve it (Better Auth updateUser may clear fields not included)
    const existingImage = session.user.image;

    // Update user via Better Auth API (excludes role - managed by admin plugin)
    // CRITICAL: Explicitly pass image to prevent Better Auth from clearing it
    await auth.api.updateUser({
      body: {
        username: username,
        displayName: displayName || undefined,
        type: type,
        step: nextStep,
        provider: 'google', // Ensure provider stays as 'google'
        confirmed: true, // Google OAuth users are now confirmed after setup
        image: existingImage || undefined, // Preserve Google profile picture
      },
      headers: await headers(),
    });

    // Update role directly via Prisma (admin plugin blocks role via API)
    if (role && ['user', 'freelancer', 'company'].includes(role)) {
      const { prisma } = await import('@/lib/prisma/client');
      await prisma.user.update({
        where: { id: session.user.id },
        data: { role: role as UserRole },
      });
    }

    // Add user to Brevo list based on type (for pro users after OAuth setup)
    // This runs asynchronously and doesn't block OAuth completion
    brevoWorkflowService
      .handleOAuthSetupComplete(
        session.user.email,
        type as 'user' | 'pro',
        {
          DISPLAY_NAME: displayName,
          USERNAME: username,
          USER_TYPE: type as 'user' | 'pro', // Type assertion for literal type
          USER_ROLE: role as 'user' | 'freelancer' | 'company' | 'admin', // Type assertion for literal type
          IS_PRO: type === 'pro',
        }
      )
      .catch((error) => {
        console.error('Failed to add user to Brevo list after OAuth:', error);
        // Don't throw - this shouldn't block OAuth setup
      });

    return {
      success: true,
      message: 'Η εγγραφή ολοκληρώθηκε επιτυχώς!',
    };
  } catch (error) {
    console.error('Error in completeOAuth:', error);
    return handleBetterAuthError(error);
  }
}
