"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  REGISTER_USER,
  UPDATE_USER,
  CREATE_FREELANCER,
} from "../graphql/mutations/user";
import { postData } from "../client/operations";
import { loginSchema, registerSchema } from "../validation/auth";
import { removeToken, setToken } from "./token";

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
      const errors = {};
      if (result.error.includes("Email")) {
        errors.email = ["Το email χρησιμοποιείται ήδη"];
      }
      if (result.error.includes("Username")) {
        errors.username = ["Το username χρησιμοποιείται ήδη"];
      }
      return { errors, message: "Λάθος στοιχεία εγγραφής." };
    }

    const { jwt, user } = result.data.register;

    if (type === 2) {
      await postData(UPDATE_USER, {
        id: user.id,
        roleId: role.toString(),
        displayName: validatedFields.data.displayName,
        consent: validatedFields.data.consent,
      });

      // Assign freelancer type based on role
      const freelancerType = role === 4 ? 1 : 2;

      await postData(CREATE_FREELANCER, {
        data: {
          user: user.id,
          username: userData.username,
          type: freelancerType,
          //  publishedAt: new Date().toISOString()
        },
      });
    } else {
      await postData(UPDATE_USER, {
        id: user.id,
        roleId: "1",
        displayName: userData.username,
        consent: validatedFields.data.consent,
      });
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

const postLoginDetails = async (url, identifier, password) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier,
        password,
      }),
      cache: "no-cache",
    });

    const data = await response.json();

    return { response, data };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Server error. Please try again later." };
  }
};

export async function login(prevState, formData) {
  const STRAPI_URL = process.env.STRAPI_API_URL;

  if (!STRAPI_URL) throw new Error("Missing STRAPI_URL environment variable.");

  const url = `${STRAPI_URL}/auth/local`;

  const validatedFields = loginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Login.",
    };
  }

  const { identifier, password } = validatedFields.data;

  const { response, data } = await postLoginDetails(url, identifier, password);

  if (!response.ok && data.error)
    return { ...prevState, message: data.error.message, errors: null };
  if (response.ok && data.jwt) {
    await setToken(data.jwt);
    redirect("/dashboard");
  }
}

export async function logout() {
  await removeToken();
  redirect("/login");
}
