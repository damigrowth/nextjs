"use server";

import { z } from "zod";
import { postData } from "../client/operations";
import { UPDATE_FREELANCER } from "../graphql/mutations";
import { revalidatePath } from "next/cache";
import {
  accountSchema,
  additionalInfoSchema,
  billingSchema,
  billingSchemaOptional,
  presentationSchema,
} from "../validation/profile";

export async function updateFreelancerStatus(id) {
  try {
    const { data, error } = await postData(UPDATE_FREELANCER, {
      id,
      data: {
        status: 1,
      },
    });

    if (error) throw error;

    revalidatePath("/dashboard/profile");
    return data;
  } catch (error) {
    console.error("Status update failed:", error);
    throw error;
  }
}

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

export async function updateBasicInfo(prevState, formData) {
  try {
    const id = formData.get("id");
    const changedFields = JSON.parse(formData.get("changes") || "{}");
    const currentFormState = JSON.parse(
      formData.get("currentFormState") || "{}"
    );
    const validateOnly = formData.get("validateOnly") === "true";

    // We don't need to fetch the freelancer - we already have the current state

    // Handle explicit error (e.g., from image upload failure)
    if (formData.get("error")) {
      const error = JSON.parse(formData.get("error"));
      return {
        data: null,
        errors: {
          // Make sure error has the exact expected structure
          image: {
            field: "image",
            message: error.message || "Error uploading image",
          },
        },
        message: null,
      };
    }

    // Create merged validation state
    let validationState = {
      ...currentFormState,
      ...changedFields,
    };

    // Ensure coverage is properly merged
    if (validationState.coverage || changedFields.coverage) {
      validationState.coverage = {
        ...(currentFormState.coverage || {}),
        ...(changedFields.coverage || {}),
      };
    }

    // Create an errors object to collect all validation errors
    const errors = {};

    // IMPORTANT: Always validate ALL required fields, not just changed ones

    // 0. Check if image is required (only if not set previously)
    const existingImage = currentFormState.image?.data?.id;
    const isImageProvided = !!(
      validationState.image?.data?.id || validationState.image?.isNewFile
    );

    if (!existingImage && !isImageProvided) {
      errors.image = {
        field: "image",
        message: "Η εικόνα προφίλ είναι υποχρεωτική",
      };
    }

    // 1. Validate coverage (required for all submissions)
    if (
      !validationState.coverage ||
      (!validationState.coverage.online &&
        !validationState.coverage.onbase &&
        !validationState.coverage.onsite)
    ) {
      errors.coverage = {
        field: "coverage",
        message: "Πρέπει να επιλέξετε τουλάχιστον έναν τρόπο κάλυψης",
      };
    }

    // 2. Check onbase requirements if selected
    if (validationState.coverage?.onbase) {
      if (!validationState.coverage.address?.trim()) {
        errors.address = {
          field: "address",
          message: "Η διεύθυνση είναι υποχρεωτική για κάλυψη στην έδρα σας",
        };
      }

      if (!validationState.coverage.zipcode?.data?.id) {
        errors.zipcode = {
          field: "zipcode",
          message: "Ο Τ.Κ. είναι υποχρεωτικός για κάλυψη στην έδρα σας",
        };
      }
    }

    // 3. Check onsite requirements if selected
    if (validationState.coverage?.onsite) {
      const hasCounties =
        Array.isArray(validationState.coverage.counties?.data) &&
        validationState.coverage.counties.data.length > 0;
      const hasAreas =
        Array.isArray(validationState.coverage.areas?.data) &&
        validationState.coverage.areas.data.length > 0;

      if (!hasCounties && !hasAreas) {
        errors.counties = {
          field: "counties",
          message:
            "Απαιτείται τουλάχιστον ένας νομός ή μια περιοχή για κάλυψη στον χώρο του πελάτη",
        };
      }
    }

    // 4. Check required category/subcategory
    const existingCategory = currentFormState.category?.data?.id;
    const existingSubcategory = currentFormState.subcategory?.data?.id;

    // Category is required if not previously set
    if (!existingCategory && !validationState.category?.data?.id) {
      errors.category = {
        field: "category",
        message: "Η κατηγορία είναι υποχρεωτική",
      };
    }

    // Subcategory is required if not previously set
    if (!existingSubcategory && !validationState.subcategory?.data?.id) {
      errors.subcategory = {
        field: "subcategory",
        message: "Η υποκατηγορία είναι υποχρεωτική",
      };
    }

    // If there are validation errors, return them
    if (Object.keys(errors).length > 0) {
      return {
        data: null,
        errors,
        message: null,
      };
    }

    // If validation only, return success without making API calls
    if (validateOnly) {
      return {
        data: null,
        errors: {},
        message: "Validation passed",
      };
    }

    // Prepare payload with only changed fields
    const payload = {};
    const changes = new Set(Object.keys(changedFields));

    // Handle image if it exists in state (uploaded from client)
    if (currentFormState.image?.data?.id) {
      // Only add image to payload if we have a valid ID
      payload.image = currentFormState.image.data.id;
    } else if (changes.has("image")) {
      // If image is being explicitly changed to null, set it to null
      payload.image = null;
    }

    // Add validated changes to payload
    for (const field of changes) {
      if (field === "image") {
        // Skip image as we've handled it separately
        continue;
      }
      if (field in validationState) {
        if (field === "coverage") {
          const coverageData = validationState[field];

          const coverageTransformed = {
            online: coverageData.online,
            onbase: coverageData.onbase,
            onsite: coverageData.onsite,
            address: coverageData.address,
            area: coverageData.area?.data?.id || null,
            county: coverageData.county?.data?.id || null,
            zipcode: coverageData.zipcode?.data?.id || null,
            counties: (coverageData.counties?.data || []).map((c) => c.id),
            areas: (coverageData.areas?.data || []).map((a) => a.id),
          };

          payload.coverage = coverageTransformed;
        } else if (
          field === "category" ||
          field === "subcategory" ||
          field === "specialization"
        ) {
          payload[field] = validationState[field].data?.id || null;
        }
        // Handle skills array
        else if (field === "skills") {
          payload[field] = (validationState[field].data || []).map(
            (item) => item.id
          );
        } else {
          payload[field] = validationState[field];
        }
      }
    }

    // Before making the API call, check if payload is empty
    if (Object.keys(payload).length === 0) {
      return {
        data: null,
        errors: {
          submit: {
            field: "submit",
            message: "No changes to save",
          },
        },
        message: null,
      };
    }

    // API call
    const { data, error } = await postData(UPDATE_FREELANCER, {
      id,
      data: payload,
    });

    if (error) {
      return {
        data: null,
        errors: {
          submit: {
            field: "submit",
            message: error.message || "Error during update",
          },
        },
        message: null,
      };
    }

    revalidatePath("/dashboard/profile");
    return {
      data,
      errors: null,
      message: "Τα στοιχεία ενημερώθηκαν με επιτυχία",
    };
  } catch (error) {
    console.error("Update failed:", error);
    return {
      data: null,
      errors: {
        submit: {
          field: "submit",
          message: error.message || "Προέκυψε σφάλμα κατά την ενημέρωση",
        },
      },
      message: null,
    };
  }
}

export async function updatePresentationInfo(prevState, formData) {
  try {
    const changedFields = JSON.parse(formData.get("changes") || "{}");
    const id = formData.get("id");

    // Create a partial schema based on changed fields
    const partialSchema = z.object(
      Object.keys(changedFields).reduce((acc, field) => {
        acc[field] = presentationSchema.shape[field];
        return acc;
      }, {})
    );

    // Validate only the changed fields
    const validationResult = partialSchema.safeParse(changedFields);

    if (!validationResult.success) {
      // Transform Zod errors to match InputB's expected format
      const fieldErrors = {};
      validationResult.error.errors.forEach((error) => {
        const path = error.path;
        let current = fieldErrors;
        for (let i = 0; i < path.length; i++) {
          const part = path[i];
          if (i === path.length - 1) {
            current[part] = { message: error.message };
          } else {
            current[part] = current[part] || {};
            current = current[part];
          }
        }
      });

      return {
        data: null,
        errors: fieldErrors,
        message: null,
      };
    }

    // Prepare the payload - only include fields that have been validated
    const payload = {};

    // Add website if changed
    if (validationResult.data.website !== undefined) {
      payload.website = validationResult.data.website;
    }

    // Add visibility if changed
    if (validationResult.data.visibility) {
      payload.visibility = validationResult.data.visibility;
    }

    // Add socials if changed
    if (validationResult.data.socials) {
      // Create clean socials object with only URL property
      payload.socials = {};

      Object.entries(validationResult.data.socials).forEach(
        ([platform, data]) => {
          if (data && data.url !== undefined) {
            // Check for undefined, not truthiness
            const trimmedUrl =
              data.url === "" || data.url === null ? null : data.url.trim();

            // Only include if the URL is not null or if we're explicitly setting it to null
            payload.socials[platform] = { url: trimmedUrl };
          }
        }
      );
    }

    // Handle media update
    const remainingMediaIds = JSON.parse(
      formData.get("remaining-media") || "[]"
    );
    const deletedMediaIds = JSON.parse(formData.get("deleted-media") || "[]");
    const allMediaDeleted = formData.get("all-media-deleted") === "true";

    // Check if there are actual media changes to process
    const hasDeletedFiles = deletedMediaIds.length > 0;
    const hasMediaChanges =
      hasDeletedFiles || allMediaDeleted || remainingMediaIds.length > 0;

    if (hasMediaChanges) {
      // Special case - if all media is deleted, explicitly set an empty portfolio
      if (allMediaDeleted && remainingMediaIds.length === 0) {
        payload.portfolio = [];
      } else {
        // Simply use the remaining media IDs directly
        // No need for file uploads since they're already handled on client side
        payload.portfolio = remainingMediaIds;
      }
    }

    // Clean empty objects from the payload, but DON'T clean empty arrays
    // when they represent intentionally empty collections like portfolio
    Object.keys(payload).forEach((key) => {
      if (
        payload[key] === undefined ||
        payload[key] === null ||
        (typeof payload[key] === "object" &&
          !Array.isArray(payload[key]) &&
          Object.keys(payload[key]).length === 0)
      ) {
        delete payload[key];
      }
    });

    // Only proceed if there are changes
    if (Object.keys(payload).length === 0) {
      return {
        data: null,
        errors: null,
        message: "Δεν υπάρχουν αλλαγές για αποθήκευση",
      };
    }

    // Execute GraphQL mutation
    const { data: gqlData, error } = await postData(UPDATE_FREELANCER, {
      id,
      data: payload,
    });

    if (error) {
      console.error("GraphQL error:", error);
      return {
        data: null,
        errors: { submit: error.message || "Error updating profile" },
        message: null,
      };
    }

    // Revalidate path to update the UI
    revalidatePath("/dashboard/profile");

    return {
      data: gqlData?.updateFreelancer?.data,
      errors: null,
      message: "Τα στοιχεία ενημερώθηκαν με επιτυχία",
    };
  } catch (error) {
    console.error("Unexpected error in updatePresentationInfo:", error);
    return {
      data: null,
      errors: {
        submit: `Unexpected error: ${error.message || "Unknown error"}`,
      },
      message: null,
    };
  }
}

export async function updateAdditionalInfo(prevState, formData) {
  const id = formData.get("id");
  const changedFieldsRaw = JSON.parse(formData.get("changes"));

  // Prepare data for validation by transforming nested data structures
  const changedFields = { ...changedFieldsRaw };
  delete changedFields.id;

  // Transform changed fields with nested data structure
  [
    "contactTypes",
    "payment_methods",
    "settlement_methods",
    "industries",
  ].forEach((field) => {
    if (changedFields[field]) {
      changedFields[field] = changedFields[field].data
        ? changedFields[field].data.map((item) => item.id)
        : [];
    }
  });

  // Handle minBudget
  if (changedFields.minBudget) {
    // Extract the ID directly from the nested structure
    changedFields.minBudget = changedFields.minBudget.data?.id || null;
  }

  // Handle size field transformation
  if (changedFields.size) {
    changedFields.size = changedFields.size || null;
  }

  // Handle terms separately since it's a simple field
  if (changedFields.terms !== undefined) {
    changedFields.terms = formData.get("terms");
  }

  // Create schema for only the changed fields
  const partialSchema = z.object(
    Object.keys(changedFields).reduce((acc, field) => {
      acc[field] = additionalInfoSchema.shape[field];
      return acc;
    }, {})
  );

  // Validate the changed fields
  const validationResult = partialSchema.safeParse(changedFields);

  if (!validationResult.success) {
    return {
      data: null,
      errors: Object.fromEntries(
        Object.entries(validationResult.error.flatten().fieldErrors)
          .filter(([_, messages]) => messages?.length > 0)
          .map(([field, messages]) => [field, { field, message: messages[0] }])
      ),
      message: null,
    };
  }

  // Prepare the payload for the API
  const payload = {};

  // Handle minBudget field explicitly
  if (validationResult.data.minBudget !== undefined) {
    payload.minBudget = validationResult.data.minBudget;
  }

  // Handle terms field
  if (validationResult.data.terms !== undefined) {
    payload.terms = validationResult.data.terms;
  }

  // Handle size field
  if (validationResult.data.size !== undefined) {
    if (validationResult.data.size.data) {
      payload.size = validationResult.data.size.data.id;
    } else {
      // When size is cleared, set to null in the payload
      payload.size = null;
    }
  }

  // Handle array fields
  [
    "contactTypes",
    "payment_methods",
    "settlement_methods",
    "industries",
  ].forEach((field) => {
    if (validationResult.data[field] !== undefined) {
      payload[field] = validationResult.data[field];
    }
  });

  // Make the API call
  const { data, error } = await postData(UPDATE_FREELANCER, {
    id,
    data: payload,
  });

  if (error) {
    return {
      data: null,
      errors: { submit: error },
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

export async function updateBillingDetails(prevState, formData) {
  const billing_details = JSON.parse(formData.get("billing_details"));
  const id = formData.get("id");

  // Choose validation schema based on invoice flag
  const validationSchema = billing_details.invoice
    ? billingSchema
    : billingSchemaOptional;

  // Validate billing details with the appropriate schema
  const validationResult = validationSchema.safeParse(billing_details);

  if (!validationResult.success) {
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

  // Process the billing details, ensuring proper types
  const processedBillingDetails = {
    ...validationResult.data,
    // If AFM exists and isn't null, ensure it's a string
    ...(validationResult.data.afm !== null &&
      validationResult.data.afm !== undefined && {
        afm: validationResult.data.afm.toString(),
      }),
  };

  const payload = {
    billing_details: processedBillingDetails,
  };

  const { data, error } = await postData(UPDATE_FREELANCER, {
    id,
    data: payload,
  });

  if (error) {
    return {
      data: null,
      errors: { submit: error },
      message: null,
    };
  }

  revalidatePath("/dashboard/profile");

  return {
    data: data.updateFreelancer.data,
    errors: null,
    message: "Τα στοιχεία τιμολόγησης ενημερώθηκαν με επιτυχία",
  };
}
