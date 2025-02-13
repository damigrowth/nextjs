"use server";

import { z } from "zod";
import { postData } from "../client/operations";
import { UPDATE_FREELANCER } from "../graphql/mutations";
import { revalidatePath } from "next/cache";
import { accountSchema, basicInfoSchema } from "./validation";

export async function updateAccountInfo(prevState, formData) {
  const changedFields = JSON.parse(formData.get("changes"));

  // Create a partial schema based on changed fields
  const partialSchema = z.object(
    Object.keys(changedFields).reduce((acc, field) => {
      acc[field] = accountSchema.shape[field];
      return acc;
    }, {})
  );

  // Validate only changed fields
  const validationResult = partialSchema.safeParse(changedFields);

  if (!validationResult.success) {
    // Transform Zod errors to match InputB's expected format
    const fieldErrors = {};

    Object.entries(validationResult.error.flatten().fieldErrors).forEach(
      ([field, messages]) => {
        if (messages && messages.length > 0) {
          fieldErrors[field] = {
            field,
            message: messages[0],
          };
        }
      }
    );

    return {
      data: null,
      errors: fieldErrors,
      message: null,
    };
  }

  const { data, error } = await postData(UPDATE_FREELANCER, {
    id: formData.get("id"),
    data: validationResult.data,
  });

  if (error) {
    return {
      data: null,
      errors: {
        submit: error,
      },
      message: null,
    };
  }

  revalidatePath("/dashboard/profile");

  return {
    data: data.updateFreelancer.data,
    errors: null,
    message: "Τα στοιχεία ενημερώθηκαν με επιτυχία",
  };
}

export async function updateBasicInfo(prevState, formData) {}

export async function updatePresentationInfo(prevState, formData) {}

export async function updateAdditionalInfo(prevState, formData) {}
