"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  // REGISTER_USER, // Keep commented or remove if not used elsewhere
  START_REGISTRATION, // Import the new mutation
  COMPLETE_REGISTRATION, // Import the new mutation
  UPDATE_USER,
  CREATE_FREELANCER,
  FORGOT_PASSWORD,
  RESET_PASSWORD,
  LOGIN_USER,
  EMAIL_CONFIRMATION, // Keep for completeRegistration for now
} from "../graphql/mutations";
import { postData } from "../client/operations";
import { loginSchema, registerSchema } from "../validation/auth";
import { removeToken, setToken } from "./token";
import { inspect } from "@/utils/inspect";
import { cookies } from "next/headers";

/**
 * Server action to handle the first step of user registration (startRegistration).
 * Sends user details (email, username, password, type, role, displayName) to the backend
 * via the START_REGISTRATION mutation. Redirects to /register/success on success.
 *
 * @param {object} prevState - The previous state from useActionState (not used here but required by the hook).
 * @param {FormData} formData - The form data containing registration details.
 * @returns {Promise<{ errors: object, message: string | null } | void>} Returns an error object or redirects.
 */
export async function register(prevState, formData) {
  const type = Number(formData.get("type"));
  const role = formData.get("role") ? Number(formData.get("role")) : null;
  const displayName = formData.get("displayName");
  const email = formData.get("email");
  const username = formData.get("username");
  const password = formData.get("password");
  const consent = formData.get("consent");

  if (!consent) {
    return {
      errors: {
        consent: ["Πρέπει να αποδεχθείς τους Όρους Χρήσης"],
      },
      message: null,
    };
  }

  // Call the START_REGISTRATION mutation
  const result = await postData(START_REGISTRATION, {
    input: {
      email: email,
      username: username,
      password: password,
      type: type,
      ...(type === 2 && { role: role, displayName: displayName }), // Only include role and displayName if type is 2 (Professional)
    },
  });

  // Handle potential GraphQL errors
  if (result.error) {
    console.error("GraphQL Error in register action:", result.error);
    return { errors: {}, message: result.error };
  }

  // Handle application-level errors from the mutation
  if (!result?.data?.startRegistration?.success) {
    console.error(
      "StartRegistration failed:",
      result?.data?.startRegistration?.message
    );
    return {
      errors: {},
      message:
        result?.data?.startRegistration?.message ||
        "Η εγγραφή απέτυχε. Παρακαλώ δοκιμάστε ξανά.",
    };
  }

  redirect("/register/success");
}

// Note: The old completeRegistration function using cookies/code is commented out
// and kept for historical reference if needed. It's replaced by confirmTokenAction.

/**
 * Server action to handle user login.
 * Validates identifier and password using loginSchema.
 * Calls the LOGIN_USER mutation. Sets the JWT token on success and redirects to the dashboard.
 *
 * @param {object} prevState - The previous state from useActionState.
 * @param {FormData} formData - The form data containing login credentials.
 * @returns {Promise<{ errors: object, message: string } | void>} Returns an error object or redirects.
 */
export async function login(prevState, formData) {
  const validatedFields = loginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Λάθος στοιχεία συνδεσης.",
    };
  }

  const { identifier, password } = validatedFields.data;

  const response = await postData(LOGIN_USER, {
    identifier,
    password,
  });

  if (response?.data?.login?.jwt) {
    await setToken(response.data.login.jwt);
    redirect("/dashboard/profile");
  } else {
    return {
      errors: {},
      message: response.error || "Κάτι πήγε στραβά. Δοκιμάστε ξανά.",
    };
  }
}

/**
 * Server action to handle user logout.
 * Removes the JWT token and redirects to the login page.
 *
 * @returns {Promise<void>} Redirects the user.
 */
export async function logout() {
  await removeToken();
  redirect("/login");
}

/**
 * Server action to handle the "forgot password" request.
 * Sends the user's email to the backend via the FORGOT_PASSWORD mutation.
 *
 * @param {object} prevState - The previous state from useActionState.
 * @param {FormData} formData - The form data containing the user's email.
 * @returns {Promise<{ success?: boolean, errors?: object, message: string }>} Returns a state object indicating success or failure.
 */
export async function forgotPassword(prevState, formData) {
  try {
    const email = formData.get("email");

    const result = await postData(FORGOT_PASSWORD, {
      email,
    });

    if (result.error) {
      return { message: result.error };
    }

    if (result.data?.forgotPassword?.ok) {
      return {
        success: true,
        errors: {},
        message:
          "Εάν το email υπάρχει στο σύστημά μας, θα λάβετε σύντομα ένα σύνδεσμο επαναφοράς κωδικού στο inbox σας.",
      };
    }
  } catch (error) {
    console.error(error);
    return {
      errors: {},
      message: "Προέκυψε σφάλμα. Δοκιμάστε ξανά αργότερα.",
    };
  }
}

/**
 * Server action to complete user registration by confirming an email token.
 * Calls the COMPLETE_REGISTRATION mutation with the provided token.
 * Sets the JWT token on success.
 *
 * @param {object} prevState - The previous state from useActionState.
 * @param {string} token - The email confirmation token from the URL.
 * @returns {Promise<{ success: boolean, message: string, redirect: boolean }>} Returns a state object indicating success or failure, and if a redirect should occur.
 */
export async function confirmTokenAction(prevState, token) {
  if (!token) {
    return {
      success: false,
      message: "Missing confirmation token.",
      redirect: false,
    };
  }

  try {
    // Call the COMPLETE_REGISTRATION mutation
    const result = await postData(COMPLETE_REGISTRATION, {
      input: {
        token: token,
      },
    });

    // Handle potential GraphQL errors
    if (result.error) {
      return { success: false, message: result.error, redirect: false };
    }

    // Handle application-level errors from the mutation
    if (!result?.data?.completeRegistration?.success) {
      const errorMessage =
        result?.data?.completeRegistration?.message || "Η επιβεβαίωση απέτυχε.";
      return {
        success: false,
        message: errorMessage,
        redirect: false,
      };
    }

    // Success case
    const { jwt } = result.data.completeRegistration;

    if (jwt) {
      await setToken(jwt); // Set the authentication token
    }

    const finalState = {
      success: true,
      message: `Επιτυχία εγγραφής!`,
      redirect: true,
    };
    return finalState;
  } catch (error) {
    // Catch unexpected errors during the process
    console.error("Unexpected error in confirmTokenAction:", error);
    return {
      success: false,
      message: "An unexpected error occurred during confirmation.", // Generic message for unhandled errors
      redirect: false,
    };
  }
}

/**
 * Server action to handle resetting the user's password using a reset code.
 * Calls the RESET_PASSWORD mutation with the new password and reset code.
 * Logs the user out if successful.
 *
 * @param {object} prevState - The previous state from useActionState.
 * @param {FormData} formData - The form data containing the new password, confirmation, and reset code.
 * @returns {Promise<{ success: boolean, message: string }>} Returns a state object indicating success or failure.
 */
export async function resetPassword(prevState, formData) {
  const password = formData.get("password");
  const passwordConfirmation = formData.get("passwordConfirmation");
  const resetCode = formData.get("resetCode");

  const response = await postData(RESET_PASSWORD, {
    password,
    passwordConfirmation,
    resetCode,
  });

  if (response.error?.includes("Λανθασμένος κωδικός επιβεβαίωσης")) {
    return {
      success: false,
      message:
        "Ο σύνδεσμος επαναφοράς έχει λήξει. Χρησιμοποιήστε νέο σύνδεσμο επαναφοράς κωδικού.",
    };
  }

  if (response?.data?.resetPassword?.jwt) {
    await logout();
  }

  return {
    success: true,
    message: "Ο κωδικός σας άλλαξε με επιτυχία!",
  };
}
