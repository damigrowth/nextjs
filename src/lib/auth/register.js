"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  REGISTER_USER,
  UPDATE_USER,
  CREATE_FREELANCER,
} from "../graphql/mutations/user";
import { postData } from "../client/operations";

const schemas = {
  base: {
    email: z.string().min(1, "Το email είναι υποχρεωτικό").email("Λάθος email"),
    username: z.string().min(4, "Το username είναι πολύ μικρό").max(25),
    password: z.string().min(6, "Ο κωδικός είναι πολύ μικρός").max(50),
  },
  professional: {
    brandName: z.string().min(3, "Η επωνυμία είναι πολύ μικρή").max(25),
  },
};

export async function register(prevState, formData) {
  try {
    const type = Number(formData.get("type"));
    const role = Number(formData.get("role"));

    const userData = {
      email: formData.get("email"),
      username: formData.get("username"),
      password: formData.get("password"),
    };

    const schema =
      type === 2
        ? z.object({ ...schemas.base, ...schemas.professional })
        : z.object(schemas.base);

    const validatedFields = schema.safeParse(
      type === 2
        ? {
            ...userData,
            brandName: formData.get("brandName"),
          }
        : userData
    );

    if (!validatedFields.success) {
      return {
        errors: Object.fromEntries(
          Object.entries(validatedFields.error.flatten().fieldErrors).map(
            ([key, value]) => [key, value]
          )
        ),
        message: "Λάθος στοιχεία εγγραφής.",
      };
    }

    const result = await postData(REGISTER_USER, {
      input: userData,
    });

    if (result.error) {
      const errors = {};
      if (result.error.includes("Email")) {
        errors.email = ["Το email χρησιμοποιείται ήδη"];
      }
      if (result.error.includes("Username")) {
        errors.username = ["Το username χρησιμοποιείται ήδη"];
      }

      return {
        errors,
        message: "Λάθος στοιχεία εγγραφής.",
      };
    }

    // const { jwt, user } = result.data.register;

    // if (type === 2) {
    //   await postData(UPDATE_USER, {
    //     id: user.id,
    //     roleId: role.toString(),
    //     displayName: validatedFields.data.brandName,
    //     brandName: validatedFields.data.brandName
    //   });

    //   await postData(CREATE_FREELANCER, {
    //     data: {
    //       user: user.id,
    //       username: userData.username
    //     }
    //   });
    // } else {
    //   await postData(UPDATE_USER, {
    //     id: user.id,
    //     roleId: "1",
    //     displayName: userData.username
    //   });
    // }

    // cookies().set("jwt", jwt);
    // redirect("/dashboard/profile");
  } catch (error) {
    console.error(error);
    return {
      errors: {},
      message: "Server error. Please try again later.",
    };
  }
}
