"use server";

import { z } from "zod";
import { postData } from "../client/operations";
import { UPDATE_FREELANCER } from "../graphql/mutations";
import { revalidatePath } from "next/cache";

const accountSchema = z.object({
  displayName: z
    .string()
    .min(2, "Το όνομα προβολής πρέπει να έχει τουλάχιστον 2 χαρακτήρες")
    .max(50, "Το όνομα προβολής δεν μπορεί να υπερβαίνει τους 50 χαρακτήρες"),
  phone: z
    .string()
    .regex(
      /^\+?[0-9]{10,15}$/,
      "Παρακαλώ εισάγετε έναν έγκυρο αριθμό τηλεφώνου"
    )
    .optional()
    .nullable(),
  address: z
    .string()
    .min(5, "Η διεύθυνση πρέπει να έχει τουλάχιστον 5 χαρακτήρες")
    .max(200, "Η διεύθυνση δεν μπορεί να υπερβαίνει τους 200 χαρακτήρες")
    .optional()
    .nullable(),
});

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

