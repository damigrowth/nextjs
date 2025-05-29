'use server';

import { revalidatePath } from 'next/cache';

import { postData } from '@/lib/client/operations';
import { CHANGE_PASSWORD } from '@/lib/graphql';

import { passwordChangeSchema } from '../schema/password';
import { removeToken } from '../auth/token';

export async function updatePassword(prevState, formData) {
  try {
    const currentPassword = formData.get('currentPassword');

    const newPassword = formData.get('newPassword');

    const confirmPassword = formData.get('confirmPassword');

    const validationResult = passwordChangeSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!validationResult.success) {
      const fieldErrors = {};

      Object.entries(validationResult.error.flatten().fieldErrors).forEach(
        ([field, messages]) => {
          if (messages && messages.length > 0) {
            fieldErrors[field] = { field, message: messages[0] };
          }
        },
      );

      return {
        data: null,
        errors: fieldErrors,
        message: null,
        success: false,
      };
    }

    const {
      currentPassword: validatedCurrentPassword,
      newPassword: validatedNewPassword,
      confirmPassword: validatedConfirmPassword,
    } = validationResult.data;

    // Call the backend to change the password
    // This assumes your postData function can handle raw GQL strings or you have it defined elsewhere
    // You might need to adjust how you call your GraphQL endpoint
    const { data, error } = await postData(CHANGE_PASSWORD, {
      currentPassword: validatedCurrentPassword,
      password: validatedNewPassword, // Pass the value from Zod's newPassword as 'password'
      passwordConfirmation: validatedConfirmPassword, // Pass the value from Zod's confirmPassword as 'passwordConfirmation'
    });

    if (error || !data?.changePassword?.jwt) {
      // Strapi's changePassword mutation returns jwt directly
      // Attempt to parse a more specific error message if available from Strapi
      let errorMessage = 'Ο τρέχων κωδικός είναι λανθασμένος';

      if (error?.message) {
        try {
          // Strapi often returns errors in a nested structure
          const parsedError = JSON.parse(error.message);

          if (parsedError?.error?.message) {
            errorMessage = parsedError.error.message;
            // Translate common Strapi error messages
            if (
              errorMessage
                .toLowerCase()
                .includes('invalid identifier or password')
            ) {
              errorMessage = 'Ο τρέχων κωδικός είναι λανθασμένος.';
            } else if (
              errorMessage.toLowerCase().includes("passwords don't match")
            ) {
              errorMessage = 'Οι νέοι κωδικοί δεν ταιριάζουν (σφάλμα server).'; // Should be caught by Zod ideally
            }
          }
        } catch (e) {
          // If parsing fails, use the generic error message from the error object
          errorMessage = error.message || errorMessage;
        }
      }

      return {
        data: null,
        errors: {
          submit: {
            field: 'submit',
            message: errorMessage,
          },
          // Optionally, set error on currentPassword if that's the likely issue
          currentPassword: {
            field: 'currentPassword',
            message: errorMessage.includes('λανθασμένος')
              ? 'Ο τρέχων κωδικός είναι λανθασμένος.'
              : '',
          },
        },
        message: null,
        success: false,
      };
    }

    // revalidatePath("/dashboard/profile"); // Moved to performPostPasswordChangeActions
    // await removeToken(); // Moved to performPostPasswordChangeActions
    return {
      data: data.changePassword, // Adjust based on actual response
      errors: null,
      message: 'Ο κωδικός πρόσβασης άλλαξε με επιτυχία!',
      success: true,
    };
  } catch (error) {
    console.error('Password update failed:', error);

    return {
      data: null,
      errors: {
        submit: {
          field: 'submit',
          message: 'Προέκυψε ένα μη αναμενόμενο σφάλμα. Δοκιμάστε ξανά.',
        },
      },
      message: null,
      success: false,
    };
  }
}

export async function successfulPasswordChange() {
  try {
    // Ensure revalidatePath is called correctly.
    // If it's meant to be conditional or needs specific data, adjust accordingly.
    revalidatePath('/dashboard/profile');
    await removeToken();

    // console.log("Post password change actions: Token removed and path revalidated.");
    return {
      success: true,
      message: 'Post-password change actions completed successfully.',
    };
  } catch (error) {
    console.error('Error in performPostPasswordChangeActions:', error);

    return {
      success: false,
      error: 'Failed to complete post-password change actions.',
    };
  }
}
