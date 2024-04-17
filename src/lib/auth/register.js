"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

// Define a schema for form validation
const formSchema = z.object({
  firstName: z
    .string()
    .min(1, "Το όνομα είναι υποχρεωτικό")
    .min(3, "Το όνομα είναι πολύ μικρό")
    .max(25, "Το όνομα είναι πολύ μεγάλο"),
  lastName: z
    .string()
    .min(1, "Το επίθετο είναι υποχρεωτικό")
    .min(3, "Το επίθετο είναι πολύ μικρό")
    .max(25, "Το επίθετο είναι πολύ μεγάλο"),
  email: z
    .string()
    .min(1, "Το email είναι υποχρεωτικό")
    .max(50, "Το email είναι πολύ μεγάλο")
    .email("Λάθος email"),
  username: z
    .string()
    .min(1, "Το username είναι υποχρεωτικό")
    .min(4, "Το username είναι πολύ μικρό")
    .max(25, "Το username είναι πολύ μεγάλο"),
  password: z
    .string()
    .min(1, "Ο κωδικός είναι υποχρεωτικός")
    .min(6, "Ο κωδικός είναι πολύ μικρός")
    .max(50, "Ο κωδικός είναι πολύ μεγάλος"),
});

// Function to register a new user
export async function register(prevState, formData) {
  try {
    const STRAPI_URL = process.env.STRAPI_API_URL;
    const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

    // Check for required environment variables
    if (!STRAPI_URL || !STRAPI_TOKEN) {
      throw new Error(
        "Missing STRAPI_API_URL or STRAPI_API_TOKEN environment variable."
      );
    }

    // API endpoints
    const registerUrl = `${STRAPI_URL}/auth/local/register`;
    const freelancerUrl = `${STRAPI_URL}/freelancers`;

    // Validate form data against schema
    const validatedFields = formSchema.safeParse({
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      username: formData.get("username"),
      email: formData.get("email"),
      password: formData.get("password"),
    });

    // Check if form data validation failed
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Missing Fields. Failed to Login.",
      };
    }

    // Destructure validated fields
    const { firstName, lastName, email, username, password } =
      validatedFields.data;

    // Make registration API call
    const response = await fetch(registerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        username,
        password,
        displayName: `${firstName} ${lastName}`,
      }),
      cache: "no-cache",
    });

    // Handle response
    if (!response.ok) {
      const data = await response.json();
      return { ...prevState, message: data.error.message, errors: null };
    }

    // If registration is successful, proceed to assign user role
    const data = await response.json();
    const userId = data.user.id;

    // API endpoint to update user role
    const userUrl = `${STRAPI_URL}/users/${userId}?populate=role`;

    const userRole = formData.get("role");

    // console.log("USERROLE=>", userRole);

    // Update user role
    const updateUserRole = await fetch(userUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
      body: JSON.stringify({
        role: userRole,
      }),
    });

    const userRoleData = await updateUserRole.json();

    // console.log("UPDATE ROLE=>", userRoleData);
    // console.log("UPDATE ROLE=>", userRoleData?.error?.details?.errors);

    // Create freelancer entry
    const createFreelancer = await fetch(freelancerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
      body: JSON.stringify({
        data: {
          firstName,
          lastName,
          username,
          displayName: `${firstName} ${lastName}`,
          user: userId,
        },
      }),
    });

    // const freelancerData = await createFreelancer.json();
    // console.log("CREATE FREELANCER=>", freelancerData);

    // Set JWT token in cookies
    cookies().set("jwt", data.jwt);

    // console.log("Registration Success!");

    // Redirect user to dashboard (uncomment when ready)
    redirect("/dashboard");
  } catch (error) {
    console.error(error);
    return { error: "Server error. Please try again later." };
  }
}
