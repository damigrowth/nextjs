"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const formSchema = z.object({
  identifier: z.string().min(2).max(50),
  password: z.string().min(6).max(100),
});

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
  const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

  if (!STRAPI_URL) throw new Error("Missing STRAPI_URL environment variable.");

  const url = `${STRAPI_URL}/auth/local`;

  const validatedFields = formSchema.safeParse({
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
    cookies().set("jwt", data.jwt);

    redirect("/dashboard");
  }
}
