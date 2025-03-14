"use server";

import { z } from "zod";
import { postData } from "../client/operations";
import { UPDATE_FREELANCER } from "../graphql/mutations";
import { revalidatePath } from "next/cache";
import {
  accountSchema,
  additionalInfoSchema,
  basicInfoSchema,
  billingSchema,
  billingSchemaOptional,
  presentationSchema,
} from "../validation/profile";
import { uploadMedia } from "../uploads/upload";
import { handleMediaUpdate } from "../uploads/update";

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
    const changedFields = JSON.parse(formData.get("changes"));
    const hasExistingImage = formData.get("hasExistingImage") === "true";
    const file = formData.get("image");
    const id = formData.get("id");

    // Create a collection of data to validate
    const dataToValidate = { ...changedFields };

    // Handle file upload separately with more explicit logic
    if (file && file instanceof File && file.size > 0) {
      // If a new file is uploaded, include it in validation
      dataToValidate.image = file;
    } else if (hasExistingImage) {
      // If there's an existing image but no new file,
      // we should keep the existing image and remove from validation
      delete dataToValidate.image;
    } else if (changedFields.image?.data) {
      // If we have image data in changedFields, keep it
      // This handles the case where an image is selected from existing media
      dataToValidate.image = changedFields.image;
    } else if (!hasExistingImage) {
      // If no existing image and no new file, validation should catch this
      dataToValidate.image = null;
    }

    // Create a partial schema based on changed fields
    const partialSchema = z.object(
      Object.keys(dataToValidate).reduce((acc, field) => {
        if (basicInfoSchema.shape[field]) {
          acc[field] = basicInfoSchema.shape[field];
        }
        return acc;
      }, {})
    );

    // Validate only changed fields
    const validationResult = partialSchema.safeParse(dataToValidate);

    if (!validationResult.success) {
      // Transform Zod errors to match the exact format requested
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

    // Prepare the payload for API
    const payload = {};

    // Handle simple fields
    if (validationResult.data.tagline !== undefined)
      payload.tagline = validationResult.data.tagline;
    if (validationResult.data.description !== undefined)
      payload.description = validationResult.data.description;
    if (validationResult.data.rate !== undefined)
      payload.rate = validationResult.data.rate;
    if (validationResult.data.commencement !== undefined)
      payload.commencement = validationResult.data.commencement;

    // Handle image upload if it exists and is a file
    if (file && file.size > 0) {
      const uploadedIds = await uploadMedia([file]);
      if (uploadedIds?.length > 0) {
        payload.image = uploadedIds[0];
      }
    } else if (validationResult.data.image?.data?.id) {
      // If we have an image ID in the validation result, use it
      payload.image = validationResult.data.image.data.id;
    } else if (!hasExistingImage && !file) {
      // This case should not reach here if validation worked correctly
      return {
        data: null,
        errors: {
          image: {
            field: "image",
            message: "Η εικόνα προφίλ είναι υποχρεωτική",
          },
        },
        message: null,
      };
    }
    // Handle nested IDs
    if (validationResult.data.category?.data?.id)
      payload.category = validationResult.data.category.data.id;
    if (validationResult.data.subcategory?.data?.id)
      payload.subcategory = validationResult.data.subcategory.data.id;
    if (validationResult.data.skills?.data) {
      payload.skills = validationResult.data.skills.data.map(
        (skill) => skill.id
      );
    }
    if (validationResult.data.specialization?.data?.id) {
      payload.specialization = validationResult.data.specialization.data.id;
    } else if (validationResult.data.specialization?.data === null) {
      payload.specialization = null;
    }

    // Handle coverage
    if (validationResult.data.coverage) {
      payload.coverage = {
        online: validationResult.data.coverage.online,
        onbase: validationResult.data.coverage.onbase,
        onsite: validationResult.data.coverage.onsite,
        address: validationResult.data.coverage.address,
        zipcode: validationResult.data.coverage.zipcode?.data?.id,
        area: validationResult.data.coverage.area?.data?.id,
        county: validationResult.data.coverage.county?.data?.id,
        counties:
          validationResult.data.coverage.counties?.data?.map((el) => el.id) ||
          [],
        areas:
          validationResult.data.coverage.areas?.data?.map((el) => el.id) || [],
      };
    }

    // Make the API call
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
            message: error,
          },
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
  } catch (error) {
    console.error("Error in updateBasicInfo:", error);
    return {
      data: null,
      errors: {
        submit: {
          field: "submit",
          message: "Προέκυψε ένα σφάλμα. Παρακαλώ δοκιμάστε ξανά.",
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
    const files = formData.getAll("media-files");
    const allMediaDeleted = formData.get("all-media-deleted") === "true";

    // Check if there are actual media changes to process
    const hasNewFiles = files.length > 0;
    const hasDeletedFiles = deletedMediaIds.length > 0;
    const hasMediaChanges = hasNewFiles || hasDeletedFiles || allMediaDeleted;

    if (hasMediaChanges) {
      // Special case - if all media is deleted, explicitly set an empty portfolio
      if (allMediaDeleted && remainingMediaIds.length === 0 && !hasNewFiles) {
        payload.portfolio = [];
      } else {
        const mediaOptions = {
          refId: id,
          ref: "api::freelancer.freelancer",
          field: "portfolio",
          namePrefix: "portfolio",
        };

        try {
          const finalMediaIds = await handleMediaUpdate({
            remainingMediaIds,
            files,
            options: mediaOptions,
            deletedMediaIds,
          });

          // Always set the portfolio in payload when there are media changes
          payload.portfolio = finalMediaIds;
        } catch (error) {
          return {
            data: null,
            errors: {
              submit: `Error processing media files: ${
                error.message || "Unknown error"
              }`,
            },
            message: null,
          };
        }
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
