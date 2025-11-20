'use server';

import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';
import { getFormString } from '@/lib/utils/form';
import { handleBetterAuthError } from '@/lib/utils/better-auth-localization';
import { ActionResponse } from '@/lib/types/api';

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

    // Determine the next step based on user type
    const nextStep = type === 'pro' ? 'ONBOARDING' : 'DASHBOARD';

    // Update user via Better Auth API (excludes role - managed by admin plugin)
    // NOTE: Don't set 'image' here - it's already set from Google OAuth and should persist
    await auth.api.updateUser({
      body: {
        username: username,
        displayName: displayName || undefined,
        type: type,
        step: nextStep,
        provider: 'google', // Ensure provider stays as 'google'
        confirmed: true, // Google OAuth users are now confirmed after setup
        // image is intentionally omitted to preserve Google profile picture
      },
      headers: await headers(),
    });

    // Update role directly via Prisma (admin plugin blocks role via API)
    if (role && ['user', 'freelancer', 'company'].includes(role)) {
      const { prisma } = await import('@/lib/prisma/client');
      await prisma.user.update({
        where: { id: session.user.id },
        data: { role: role },
      });
    }

    return {
      success: true,
      message: 'Η εγγραφή ολοκληρώθηκε επιτυχώς!',
    };
  } catch (error) {
    console.error('Error in completeOAuth:', error);
    return handleBetterAuthError(error);
  }
}
