'use server';

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { registerSchema } from '@/lib/validations/auth';
import { ActionResult, ActionResponse } from '@/lib/types/api';
import { RegisterInput } from '@/lib/validations/auth';
import { getFormString, getFormArray } from '@/lib/utils/form';
import { createValidationErrorResponse } from '@/lib/utils/zod';
import { handleBetterAuthError } from '@/lib/utils/better-auth-error';
import { brevoWorkflowService } from '@/lib/email';
import { generateUsernameFromEmail, formatDisplayName } from '@/lib/utils/validation/formats';

/**
 * Register action wrapper for useActionState
 */
export async function register(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  let emailValue = '';

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

    // Determine user role and type from the new string-based authType
    const authType = getFormString(formData, 'authType'); // 'user' or 'pro'
    const role = getFormString(formData, 'role'); // 'freelancer' or 'company'
    
    let userRole = 'user';
    let userType = 'user';
    
    if (authType === 'pro') {
      userType = 'pro';
      userRole = role || 'freelancer'; // Default to freelancer if role not specified
    }

    // Get displayName - only for professionals, undefined for regular users
    emailValue = getFormString(formData, 'email');
    let usernameValue = getFormString(formData, 'username');

    // For simple users, auto-generate username from email
    if (authType === 'user' && !usernameValue) {
      usernameValue = generateUsernameFromEmail(emailValue);
    }

    const displayNameRaw =
      getFormString(formData, 'displayName') || usernameValue;
    const displayNameValue = displayNameRaw
      ? formatDisplayName(displayNameRaw)
      : usernameValue;

    const validatedFields = registerSchema.safeParse({
      email: emailValue,
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

    // Check username availability using Better Auth's official API
    // For simple users, if auto-generated username is taken, append random digits
    let finalUsername = data.username;
    const usernameCheck = await auth.api.isUsernameAvailable({
      body: { username: finalUsername },
    });

    if (!usernameCheck?.available) {
      if (authType === 'user') {
        // Auto-generate a unique username by appending random digits
        for (let i = 0; i < 5; i++) {
          const suffix = Math.floor(Math.random() * 10000);
          const candidate = `${finalUsername}${suffix}`;
          const check = await auth.api.isUsernameAvailable({
            body: { username: candidate },
          });
          if (check?.available) {
            finalUsername = candidate;
            break;
          }
        }
      } else {
        return {
          success: false,
          message: 'Το συγκεκριμένο username χρησιμοποιείται ήδη. Επιλέξτε ένα διαφορετικό username.',
        };
      }
    }

    // Determine callback URL based on user type
    const callbackURL = userType === 'pro' ? '/onboarding' : '/dashboard';

    // Use Better Auth to create user
    // NOTE: The admin plugin blocks direct 'role' assignment for security.
    // Instead, we pass the role via 'proRole' field which the database hook will read.
    const result = await auth.api.signUpEmail({
      body: {
        email: data.email,
        password: data.password,
        username: finalUsername,
        name: data.displayName,
        displayName: data.displayName,
        type: userType, // 'user' or 'pro'
        provider: 'email', // Email/password registration
        proRole: userRole, // 'user', 'freelancer', or 'company' - read by database hook
        callbackURL, // Redirect based on user type after email verification
      } as any, // Type assertion needed for custom fields not in Better Auth types
    });

    if (!result.user) {
      return {
        success: false,
        message: 'Αποτυχία εγγραφής. Παρακαλώ δοκιμάστε ξανά.',
      };
    }

    // Add user to Brevo list based on type
    // This runs asynchronously and doesn't block registration
    brevoWorkflowService
      .handleUserRegistration(
        result.user.email,
        userType as 'user' | 'pro',
        {
          DISPLAY_NAME: data.displayName,
          USERNAME: finalUsername,
          USER_TYPE: userType as 'user' | 'pro', // Type assertion for literal type
          USER_ROLE: userRole as 'user' | 'freelancer' | 'company' | 'admin', // Type assertion for literal type
          REGISTRATION_DATE: new Date().toISOString(),
          IS_PRO: userType === 'pro',
        }
      )
      .catch((error) => {
        console.error('Failed to add user to Brevo list:', error);
        // Don't throw - this shouldn't block registration
      });
  } catch (error: any) {
    // Use comprehensive Better Auth error handling
    return handleBetterAuthError(error);
  }

  // Server-side redirect like login action does (outside try/catch)
  redirect(`/register/success?email=${encodeURIComponent(emailValue)}`);
}
