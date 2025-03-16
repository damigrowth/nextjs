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
// We no longer need handleMediaUpdate as files are uploaded client-side

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
    const currentFormState = JSON.parse(
      formData.get("currentFormState") || "{}"
    );

    // Ensure currentFormState.coverage is not null to avoid validation issues
    if (currentFormState.coverage === null) {
      currentFormState.coverage = {
        online: false,
        onbase: false,
        onsite: false,
      };
    }

    // 1. Determine current validity of required fields
    const currentValidity = {
      category: !!currentFormState.category?.data?.id,
      subcategory: !!currentFormState.subcategory?.data?.id,
      image: hasExistingImage,
      coverage: basicInfoSchema.shape.coverage.safeParse(
        currentFormState.coverage
      ).success,
    };

    // 2. Prepare validation schema with conditional requirements
    const validationSchema = z
      .object({
        category: basicInfoSchema.shape.category.optional(),
        subcategory: basicInfoSchema.shape.subcategory.optional(),
        image: basicInfoSchema.shape.image.optional(),
        coverage: basicInfoSchema.shape.coverage.optional(),
      })
      .superRefine((val, ctx) => {
        // Category check
        if (!currentValidity.category && !val.category?.data?.id) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Η κατηγορία είναι υποχρεωτική",
            path: ["category"],
          });
        }

        // Subcategory check
        if (!currentValidity.subcategory && !val.subcategory?.data?.id) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Η υποκατηγορία είναι υποχρεωτική",
            path: ["subcategory"],
          });
        }

        // Image check - Only validate if no existing image and no file in formData
        if (!currentValidity.image) {
          // We need to check if there's an image in the validation data
          // or if a file was uploaded directly via formData
          const hasImageData = !!val.image?.data?.id;
          const hasFileInFormData =
            file && file instanceof File && file.size > 0;

          if (!hasImageData && !hasFileInFormData) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Η εικόνα προφίλ είναι υποχρεωτική",
              path: ["image"],
            });
          }
        }

        // Coverage check - always validate that at least one is selected
        // regardless of current validity
        const coverage = val.coverage || {};
        if (!coverage.online && !coverage.onbase && !coverage.onsite) {
          // Check if the currentFormState has at least one coverage type
          const hasCoverageInCurrentState =
            currentFormState.coverage?.online === true ||
            currentFormState.coverage?.onbase === true ||
            currentFormState.coverage?.onsite === true;

          // Only add the error if neither the changed values nor current state has coverage
          if (!hasCoverageInCurrentState) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Πρέπει να επιλέξετε τουλάχιστον έναν τρόπο κάλυψης",
              path: ["coverage"],
            });
          }
        }
      });

    // 3. Validate only the changed fields
    const validationResult = validationSchema.safeParse(changedFields);

    if (!validationResult.success) {
      const fieldErrors = {};
      Object.entries(validationResult.error.flatten().fieldErrors).forEach(
        ([field, messages]) => {
          if (messages?.length > 0) {
            fieldErrors[field] = { field, message: messages[0] };
          }
        }
      );
      return { data: null, errors: fieldErrors, message: null };
    }

    // 4. Prepare payload with merged data
    const payload = {
      // Use existing valid data or new validated data
      category: currentValidity.category
        ? currentFormState.category.data.id
        : validationResult.data.category.data.id,

      subcategory: currentValidity.subcategory
        ? currentFormState.subcategory.data.id
        : validationResult.data.subcategory.data.id,
    };

    // 5. Handle image upload
    if (!currentValidity.image) {
      // Check if there's a file in the formData
      const hasUploadedFile = file && file instanceof File && file.size > 0;

      if (hasUploadedFile) {
        // Process the new file upload
        const uploadedIds = await uploadMedia([file]);
        payload.image = uploadedIds?.[0];
      } else if (validationResult.data.image?.data?.id) {
        // Use image ID from validation result
        payload.image = validationResult.data.image.data.id;
      } else {
        // No existing image and no new image provided
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
    }

    // 6. Handle coverage data structure
    if (validationResult.data.coverage || currentFormState.coverage) {
      const coverageData =
        validationResult.data.coverage || currentFormState.coverage;

      // Check if at least one coverage type is selected
      const hasAnyCoverage =
        coverageData.online === true ||
        coverageData.onbase === true ||
        coverageData.onsite === true;

      if (!hasAnyCoverage) {
        return {
          data: null,
          errors: {
            coverage: {
              field: "coverage",
              message: "Πρέπει να επιλέξετε τουλάχιστον έναν τρόπο κάλυψης",
            },
          },
          message: null,
        };
      }

      const errors = {};

      // Additional validation for onbase mode
      if (coverageData.onbase === true) {
        // Validate address is provided
        if (!coverageData.address || coverageData.address.trim() === "") {
          errors.address = {
            field: "address",
            message: "Η διεύθυνση είναι υποχρεωτική για κάλυψη στην έδρα σας",
          };
        }

        // Validate zipcode is provided
        if (!coverageData.zipcode?.data?.id) {
          errors.zipcode = {
            field: "zipcode",
            message: "Ο Τ.Κ. είναι υποχρεωτικός για κάλυψη στην έδρα σας",
          };
        }
      }

      // Additional validation for onsite mode
      if (coverageData.onsite === true) {
        const hasCounties =
          Array.isArray(coverageData.counties?.data) &&
          coverageData.counties.data.length > 0;

        const hasAreas =
          Array.isArray(coverageData.areas?.data) &&
          coverageData.areas.data.length > 0;

        if (!hasCounties && !hasAreas) {
          errors.counties = {
            field: "counties",
            message:
              "Για την κάλυψη στο χώρο του πελάτη απαιτείται τουλάχιστον ένας νομός ή μια περιοχή",
          };
        }
      }

      // Return errors if any found
      if (Object.keys(errors).length > 0) {
        return {
          data: null,
          errors,
          message: null,
        };
      }

      payload.coverage = {
        online: coverageData.online,
        onbase: coverageData.onbase,
        onsite: coverageData.onsite,
        address: coverageData.address,
        zipcode: coverageData.zipcode?.data?.id,
        area: coverageData.area?.data?.id,
        county: coverageData.county?.data?.id,
        counties: coverageData.counties?.data?.map((c) => c.id) || [],
        areas: coverageData.areas?.data?.map((a) => a.id) || [],
      };

      // Remove undefined values
      payload.coverage = Object.fromEntries(
        Object.entries(payload.coverage).filter(([_, v]) => v !== undefined)
      );
    }

    // 7. Handle other fields
    const optionalFields = [
      "tagline",
      "description",
      "rate",
      "commencement",
      "skills",
      "specialization",
    ];
    optionalFields.forEach((field) => {
      if (validationResult.data[field] !== undefined) {
        payload[field] = validationResult.data[field];
      }
    });

    // 8. Process nested fields
    if (validationResult.data.skills?.data) {
      payload.skills = validationResult.data.skills.data.map(
        (skill) => skill.id
      );
    } else if (currentFormState.skills?.data) {
      // Use existing skills if not in changed fields
      payload.skills = currentFormState.skills.data.map((skill) => skill.id);
    }

    // Handle specialization correctly
    if (validationResult.data.specialization?.data?.id) {
      payload.specialization = validationResult.data.specialization.data.id;
    } else if (currentFormState.specialization?.data?.id) {
      // Use existing specialization if not in changed fields
      payload.specialization = currentFormState.specialization.data.id;
    } else {
      // Explicitly set to null if not selected
      payload.specialization = null;
    }

    // 9. API call
    const { data, error } = await postData(UPDATE_FREELANCER, {
      id,
      data: payload,
    });

    if (error) {
      return {
        data: null,
        errors: { submit: { field: "submit", message: error } },
        message: null,
      };
    }

    // 10. Revalidation and return
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
