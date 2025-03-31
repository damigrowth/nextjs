"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  REGISTER_USER,
  UPDATE_USER,
  CREATE_FREELANCER,
  FORGOT_PASSWORD,
  RESET_PASSWORD,
  LOGIN_USER,
  EMAIL_CONFIRMATION,
} from "../graphql/mutations";
import { postData } from "../client/operations";
import { loginSchema, registerSchema } from "../validation/auth";
import { removeToken, setToken } from "./token";
import { inspect } from "@/utils/inspect";
import { cookies } from "next/headers";

export async function register(prevState, formData) {
  const type = Number(formData.get("type"));
  const role = Number(formData.get("role"));
  const consent = formData.get("consent");

  if (!consent) {
    return {
      errors: {
        consent: ["Πρέπει να αποδεχθείς τους Όρους Χρήσης"],
      },
    };
  }

  const userData = {
    email: formData.get("email"),
    username: formData.get("username"),
    password: formData.get("password"),
    consent: true,
  };

  // Store registration data in cookies
  (await cookies()).set(
    "registration_data",
    JSON.stringify({
      type,
      role,
      displayName: type === 2 ? formData.get("displayName") : userData.username,
      consent: true,
    })
  );

  const result = await postData(REGISTER_USER, {
    input: {
      email: userData.email,
      username: userData.username,
      password: userData.password,
    },
  });

  if (result.error) {
    return { message: result.error };
  }

  redirect("/register/success");
}

// Complete registration action
export async function completeRegistration(prevState, formData) {
  const code = formData.get("code");

  // First verify email with Strapi
  const confirmationResult = await postData(EMAIL_CONFIRMATION, {
    code,
  });

  if (!confirmationResult?.data?.emailConfirmation?.jwt) {
    return {
      success: false,
      message: "Σφάλμα ταυτοποίησης, ο σύνδεσμος έχει λήξει.",
    };
  }

  const { jwt, user } = confirmationResult.data.emailConfirmation;
  const userId = user.id;

  // Δημιουργία προφίλ απλού χρήστη (Freelancer τύπου 3)
  const freelancer = await postData(
    CREATE_FREELANCER,
    {
      data: {
        user: userId,
        username: user.username,
        email: user.email,
        displayName: user.username,
        type: "3",
        publishedAt: new Date().toISOString(),
      },
    },
    jwt
  );

  const freelancerId = freelancer.data?.createFreelancer?.data?.id;

  // Ενημέρωση του χρήστη με το προφίλ freelancer
  await postData(
    UPDATE_USER,
    {
      id: userId,
      roleId: "1", // Βασικός ρόλος χρήστη
      freelancer: freelancerId,
      username: user.username,
      displayName: user.username,
      consent: true,
    },
    jwt
  );

  // Καθαρισμός των cookies (για συμβατότητα)
  try {
    (await cookies()).delete("registration_data");
  } catch (e) {
    // Αγνόηση σφαλμάτων cookies
  }

  await setToken(jwt);
  return {
    success: true,
    message: `Καλώς ήρθες ${user.username}!`,
    redirect: true,
  };
}

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

export async function logout() {
  await removeToken();
  redirect("/login");
}

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