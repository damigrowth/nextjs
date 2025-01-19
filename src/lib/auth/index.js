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
} from "../graphql/mutations/user";
import { postData } from "../client/operations";
import { loginSchema, registerSchema } from "../validation/auth";
import { removeToken, setToken } from "./token";
import { inspect } from "@/utils/inspect";

export async function register(prevState, formData) {
  try {
    const type = Number(formData.get("type"));
    const role = Number(formData.get("role"));
    const consent = formData.get("consent") === "true";

    const userData = {
      email: formData.get("email"),
      username: formData.get("username"),
      password: formData.get("password"),
      consent,
    };

    const schema =
      type === 2
        ? z.object({ ...registerSchema.base, ...registerSchema.professional })
        : z.object(registerSchema.base);

    const validatedFields = schema.safeParse(
      type === 2
        ? {
            ...userData,
            displayName: formData.get("displayName"),
            role,
          }
        : userData
    );

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Λάθος στοιχεία εγγραφής.",
      };
    }

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

    const { jwt, user } = result.data.register;
    const userId = user.id;

    if (type === 1) {
      const freelancer = await postData(
        CREATE_FREELANCER,
        {
          data: {
            user: userId,
            username: userData.username,
            email: userData.email,
            displayName: userData.username,
            type: "3",
          },
        },
        jwt
      );

      const freelancerId = freelancer.data?.createFreelancer?.data?.id;

      await postData(
        UPDATE_USER,
        {
          id: userId,
          roleId: "1",
          freelancer: freelancerId,
          username: userData.username,
          displayName: userData.username,
          consent: validatedFields.data.consent,
        },
        jwt
      );
    } else {
      // Assign freelancer type based on role
      const freelancerType = role === 4 ? 1 : 2;

      const freelancer = await postData(
        CREATE_FREELANCER,
        {
          data: {
            user: userId,
            username: userData.username,
            email: userData.email,
            displayName: validatedFields.data.displayName,
            type: freelancerType.toString(),
          },
        },
        jwt
      );

      const freelancerId = freelancer.data?.createFreelancer?.data?.id;

      await postData(
        UPDATE_USER,
        {
          id: userId,
          roleId: role.toString(),
          freelancer: freelancerId,
          username: userData.username,
          displayName: validatedFields.data.displayName,
          consent: validatedFields.data.consent,
        },
        jwt
      );
    }

    await setToken(jwt);
    return {
      success: true,
      message: `Καλώς ήρθες ${userData.username}!`,
      redirect: "/dashboard/profile",
    };
  } catch (error) {
    console.error(error);
    return {
      errors: {},
      message: "Server error. Please try again later.",
    };
  }
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
      message: response.error || "Κάτι πήγε στραβά. Παρακαλώ δοκιμάστε ξανά.",
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
      message: "Προέκυψε σφάλμα. Παρακαλώ δοκιμάστε ξανά αργότερα.",
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
        "Ο σύνδεσμος επαναφοράς έχει λήξει. Παρακαλώ χρησιμοποιήστε νέο σύνδεσμο επαναφοράς κωδικού.",
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
