'use server';

import { revalidatePath } from 'next/cache';

import { postData } from '@/lib/client/operations';
import { CHANGE_PASSWORD } from '@/lib/graphql';

import { passwordChangeSchema } from '@/lib/validations';
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
    const response = await postData(CHANGE_PASSWORD, {
      currentPassword: validatedCurrentPassword,
      password: validatedNewPassword,
      passwordConfirmation: validatedConfirmPassword,
    });

    // ✅ Check SUCCESS first
    if (response?.data?.changePassword?.jwt) {
      return {
        data: response.data.changePassword,
        errors: null,
        message: 'Ο κωδικός πρόσβασης άλλαξε με επιτυχία!',
        success: true,
      };
    }

    // ✅ Handle ERRORS from postData (Greek messages)
    if (response?.error) {
      // Attempt to parse more specific error messages if available from Strapi
      let errorMessage = response.error; // Start with the Greek error from postData

      // If it's still an English error from Strapi, translate common messages
      if (typeof errorMessage === 'string') {
        if (errorMessage.toLowerCase().includes('invalid identifier or password')) {
          errorMessage = 'Ο τρέχων κωδικός είναι λανθασμένος.';
        } else if (errorMessage.toLowerCase().includes("passwords don't match")) {
          errorMessage = 'Οι νέοι κωδικοί δεν ταιριάζουν (σφάλμα server).';
        }
      }

      return {
        data: null,
        errors: {
          submit: {
            field: 'submit',
            message: errorMessage, // Translated Greek error message
          },
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

    // ✅ Fallback if no data and no error
    return {
      data: null,
      errors: {
        submit: {
          field: 'submit',
          message: 'Ο τρέχων κωδικός είναι λανθασμένος',
        },
      },
      message: null,
      success: false,
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
