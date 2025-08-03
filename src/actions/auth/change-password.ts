'use server';

import { auth } from '@/lib/auth';
import { passwordChangeSchema } from '@/lib/validations/auth';
import { ActionResponse } from '@/lib/types/api';
import { PasswordChangeInput } from '@/lib/validations/auth';
import { getFormString } from '@/lib/utils/form';
import { createValidationErrorResponse } from '@/lib/utils/zod';
import { handleBetterAuthError } from '@/lib/utils/better-auth-localization';
import { getSession } from './server';

export async function changePassword(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const validatedFields = passwordChangeSchema.safeParse({
      currentPassword: getFormString(formData, 'currentPassword'),
      newPassword: getFormString(formData, 'newPassword'),
      confirmPassword: getFormString(formData, 'confirmPassword'),
    });

    if (!validatedFields.success) {
      return createValidationErrorResponse(
        validatedFields.error,
        'Μη έγκυρα δεδομένα αλλαγής κωδικού',
      );
    }

    const { currentPassword: oldPassword, newPassword: validatedNewPassword } =
      validatedFields.data;

    // Get current session to identify the user
    const sessionResult = await getSession();

    if (!sessionResult.success || !sessionResult.data) {
      return {
        success: false,
        message: 'Πρέπει να είστε συνδεδεμένος για να αλλάξετε τον κωδικό σας',
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
        message: 'Ο τρέχων κωδικός είναι λάθος',
      };
    }

    return {
      success: true,
      message: 'Ο κωδικός άλλαξε επιτυχώς!',
    };
  } catch (error: any) {
    // Use comprehensive Better Auth error handling
    return handleBetterAuthError(error);
  }
}
