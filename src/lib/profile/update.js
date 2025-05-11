"use server";

import { z } from "zod";
import { postData } from "../client/operations";
import {
  CHANGE_PASSWORD,
  UPDATE_FREELANCER,
  VERIFICATION,
} from "../graphql/mutations";
import { revalidatePath } from "next/cache";
import { removeToken } from "@/lib/auth/token"; // Added import for removeToken
import {
  accountSchema,
  profileImageSchema, // Assuming profileImageSchema exists or we define one
  additionalInfoSchema,
  billingSchema,
  billingSchemaOptional,
  presentationSchema,
  verificationFormSchema,
  passwordChangeSchema, // Added import
} from "../validation/profile";

export async function verificationUpdate(prevState, formData) {
  try {
    // Get form values directly - let the Zod schema handle coercion
    const fid = formData.get("fid");
    const email = formData.get("email");
    const afm = formData.get("afm");
    const brandName = formData.get("brandName");
    const address = formData.get("address");
    const phone = formData.get("phone");

    // Prepare the data for validation
    // The z.coerce in the schema will handle string-to-number conversion
    const fields = {
      afm,
      brandName,
      address,
      phone,
    };

    // Validate using Zod schema with coerce
    const validationResult = verificationFormSchema.safeParse(fields);

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
    const validatedData = validationResult.data;

    // Make the API call with validated data
    // The schema already coerced string values to numbers where needed
    const data = await postData(VERIFICATION, {
      data: {
        afm: validatedData.afm,
        brandName: validatedData.brandName || "",
        address: validatedData.address || "",
        phone: validatedData.phone,
        email,
        status: 2,
        publishedAt: new Date(),
        freelancer: fid,
      },
    });

    // Check for successful response
    if (!data?.data?.createVerification?.data?.id) {
      return {
        data: null,
        errors: {
          submit: {
            field: "submit",
            message: "Αποτυχία αποστολής αίτησης πιστοποίησης. Δοκιμάστε ξανά.",
          },
        },
        message: null,
      };
    } else {
      revalidatePath("/dashboard/profile");
      return {
        data: data.data.createVerification.data,
        errors: null,
        message: "Επιτυχία αποστολής αίτησης πιστοποίησης!",
      };
    }
  } catch (error) {
    console.error("Verification update failed:", error);

    return {
      data: null,
      errors: {
        submit: {
          field: "submit",
          message:
            error.message ||
            "Προέκυψε σφάλμα κατά την επεξεργασία της αίτησης.",
        },
      },
      message: null,
    };
  }
}

export async function updatePassword(prevState, formData) {
  try {
    const currentPassword = formData.get("currentPassword");
    const newPassword = formData.get("newPassword");
    const confirmPassword = formData.get("confirmPassword");

    const validationResult = passwordChangeSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!validationResult.success) {
      const fieldErrors = {};
      Object.entries(validationResult.error.flatten().fieldErrors).forEach(
        ([field, messages]) => {
          if (messages && messages.length > 0) {
            fieldErrors[field] = { field, message: messages[0] };
          }
        }
      );
      return {
        data: null,
        errors: fieldErrors,
        message: null,
        success: false,
      };
    }

    const {
      currentPassword: validatedCurrentPassword,
      newPassword: validatedNewPassword,
      confirmPassword: validatedConfirmPassword,
    } = validationResult.data;

    // Call the backend to change the password
    // This assumes your postData function can handle raw GQL strings or you have it defined elsewhere
    // You might need to adjust how you call your GraphQL endpoint
    const { data, error } = await postData(CHANGE_PASSWORD, {
      currentPassword: validatedCurrentPassword,
      password: validatedNewPassword, // Pass the value from Zod's newPassword as 'password'
      passwordConfirmation: validatedConfirmPassword, // Pass the value from Zod's confirmPassword as 'passwordConfirmation'
    });

    if (error || !data?.changePassword?.jwt) {
      // Strapi's changePassword mutation returns jwt directly
      // Attempt to parse a more specific error message if available from Strapi
      let errorMessage = "Ο τρέχων κωδικός είναι λανθασμένος";
      if (error?.message) {
        try {
          // Strapi often returns errors in a nested structure
          const parsedError = JSON.parse(error.message);
          if (parsedError?.error?.message) {
            errorMessage = parsedError.error.message;
            // Translate common Strapi error messages
            if (
              errorMessage
                .toLowerCase()
                .includes("invalid identifier or password")
            ) {
              errorMessage = "Ο τρέχων κωδικός είναι λανθασμένος.";
            } else if (
              errorMessage.toLowerCase().includes("passwords don't match")
            ) {
              errorMessage = "Οι νέοι κωδικοί δεν ταιριάζουν (σφάλμα server)."; // Should be caught by Zod ideally
            }
          }
        } catch (e) {
          // If parsing fails, use the generic error message from the error object
          errorMessage = error.message || errorMessage;
        }
      }

      return {
        data: null,
        errors: {
          submit: {
            field: "submit",
            message: errorMessage,
          },
          // Optionally, set error on currentPassword if that's the likely issue
          currentPassword: {
            field: "currentPassword",
            message: errorMessage.includes("λανθασμένος")
              ? "Ο τρέχων κωδικός είναι λανθασμένος."
              : "",
          },
        },
        message: null,
        success: false,
      };
    }

    // revalidatePath("/dashboard/profile"); // Moved to performPostPasswordChangeActions
    // await removeToken(); // Moved to performPostPasswordChangeActions

    return {
      data: data.changePassword, // Adjust based on actual response
      errors: null,
      message: "Ο κωδικός πρόσβασης άλλαξε με επιτυχία!",
      success: true,
    };
  } catch (error) {
    console.error("Password update failed:", error);
    return {
      data: null,
      errors: {
        submit: {
          field: "submit",
          message: "Προέκυψε ένα μη αναμενόμενο σφάλμα. Δοκιμάστε ξανά.",
        },
      },
      message: null,
      success: false,
    };
  }
}

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
  const currentFormState = JSON.parse(formData.get("currentFormState") || "{}"); // Get current state
  const type = formData.get("type"); // Get type
  const isUser = type === "user";
  const validateOnly = formData.get("validateOnly") === "true"; // Check for validation-only requests

  // Handle explicit error from client (e.g., image upload failure)
  if (formData.get("error")) {
    const error = JSON.parse(formData.get("error"));
    const errors = {};
    if (isUser) {
      // Only add image error if it's a user
      errors.image = {
        field: "image",
        message: error.message || "Error processing image",
      };
    }
    errors.submit = {
      // Add a general submit error too
      field: "submit",
      message: error.message || "Error processing request",
    };
    return {
      data: null,
      errors: errors,
      message: null,
    };
  }

  // --- Start Simplified Validation ---
  // 1. Schema for non-image fields only
  const nonImageSchemaFields = { ...accountSchema.shape };
  delete nonImageSchemaFields.image; // Ensure image is not in the base schema

  // 2. Create partial schema for changed non-image fields
  const partialNonImageSchema = z.object(
    Object.keys(changedFields).reduce((acc, field) => {
      // Only include non-image fields that are in accountSchema
      if (nonImageSchemaFields[field] && field !== "image") {
        acc[field] = nonImageSchemaFields[field];
      }
      return acc;
    }, {})
  );

  // 3. Prepare data for non-image validation (only changed non-image fields)
  const nonImageDataToValidate = { ...changedFields };
  delete nonImageDataToValidate.image; // Remove image before validation

  // 4. Validate non-image fields
  const nonImageValidationResult = partialNonImageSchema.safeParse(
    nonImageDataToValidate
  );

  // 5. Return errors if non-image validation failed
  if (!nonImageValidationResult.success) {
    const fieldErrors = {};
    Object.entries(
      nonImageValidationResult.error.flatten().fieldErrors
    ).forEach(([field, messages]) => {
      if (messages && messages.length > 0) {
        fieldErrors[field] = { field, message: messages[0] };
      }
    });
    return {
      data: null,
      errors: fieldErrors,
      message: null,
    };
  }
  // --- End Simplified Validation ---

  // If validation only, return success without making API calls
  if (validateOnly) {
    return {
      data: null,
      errors: {},
      message: "Validation passed", // Or null if preferred
    };
  }

  // --- Start Simplified Payload Preparation ---
  // Prepare payload for API: Start with validated non-image data
  const payload = { ...nonImageValidationResult.data }; // Use data from successful non-image validation

  // Conditionally add the image ID directly to the payload if it's a user
  // Check if the image field was part of the intended changes OR if it exists in the final state
  if (
    isUser &&
    (changedFields.hasOwnProperty("image") ||
      currentFormState.image !== undefined)
  ) {
    const imageId = currentFormState.image?.data?.id;
    // Add the image field to the payload with the direct ID or null
    payload.image = imageId || null;
  }
  // --- End Simplified Payload Preparation ---

  // API call
  const { data, error } = await postData(UPDATE_FREELANCER, {
    id: formData.get("id"),
    data: payload, // Send the final payload
  });

  // ... rest of the error handling and success response ...
  if (error) {
    return {
      data: null,
      errors: {
        submit: {
          // Ensure submit error has field and message
          field: "submit",
          message: error.message || "Error during update",
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

    // Handle empty tagline
    if (changedFields.tagline === "") {
      validationState.tagline = "";
      // Remove any existing tagline errors
      if (errors.tagline) {
        delete errors.tagline;
      }
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
          message: "Η διεύθυνση είναι υποχρεωτική για κάλυψη στον χώρο σας",
        };
      }

      if (!validationState.coverage.zipcode?.data?.id) {
        errors.zipcode = {
          field: "zipcode",
          message: "Ο Τ.Κ. είναι υποχρεωτικός για κάλυψη στον χώρο σας",
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
    const id = formData.get("id");
    const changesJson = formData.get("changes");
    const changes = changesJson ? JSON.parse(changesJson) : {};
    const validateOnly = formData.get("validateOnly") === "true";

    // Handle explicit error (e.g., from file upload failure)
    if (formData.get("error")) {
      const error = JSON.parse(formData.get("error"));
      return {
        data: null,
        errors: {
          submit: {
            message: error.message || "Error uploading files",
          },
        },
        message: null,
      };
    }

    // Collect validation errors
    const errors = {};

    // Validate website format if changed
    if (changes.website !== undefined) {
      // Simple URL validation
      if (changes.website && !isValidUrl(changes.website)) {
        errors.website = {
          message: "Εισάγετε έγκυρη διεύθυνση ιστοσελίδας",
        };
      }
    }

    // Validate social media URLs if changed
    if (changes.socials) {
      const socialErrors = {};

      // Check each platform that has a URL
      Object.entries(changes.socials).forEach(([platform, data]) => {
        if (data && data.url) {
          // Skip empty URLs
          if (data.url.trim() === "") {
            return;
          }

          // Validate URL format
          if (!isValidUrl(data.url)) {
            socialErrors[platform] = {
              message: "Εισάγετε μία έγκυρη διεύθυνση URL",
            };
          }

          // Additional platform-specific validation could be added here
          // For example, checking if the URL matches the expected pattern for each platform
        }
      });

      // Add social errors if any were found
      if (Object.keys(socialErrors).length > 0) {
        errors.socials = socialErrors;
      }
    }

    // For validation-only requests, check media state if provided
    if (validateOnly && formData.get("mediaState")) {
      const mediaState = JSON.parse(formData.get("mediaState"));

      // Add any media-specific validation here if needed
      // For example, check if the maximum number of files would be exceeded
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

    // Process media updates if needed
    const remainingMedia = formData.get("remaining-media");
    const deletedMedia = formData.get("deleted-media");
    const allMediaDeleted = formData.get("all-media-deleted") === "true";

    // Add media changes to the payload if provided
    if (remainingMedia || deletedMedia || allMediaDeleted) {
      // If all media was deleted
      if (allMediaDeleted) {
        changes.portfolio = [];
      }
      // If we have remaining media IDs
      else if (remainingMedia) {
        changes.portfolio = JSON.parse(remainingMedia);
      }
    }

    // Make the API call to update the freelancer presentation info
    const { data, error } = await postData(UPDATE_FREELANCER, {
      id,
      data: changes,
    });

    if (error) {
      return {
        data: null,
        errors: {
          submit: {
            message: error.message || "Error during update",
          },
        },
        message: null,
      };
    }

    // Success - revalidate the path to refresh data
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
          message: error.message || "Προέκυψε σφάλμα κατά την ενημέρωση",
        },
      },
      message: null,
    };
  }
}

// Helper function to validate URLs
function isValidUrl(string) {
  try {
    // Allow empty values
    if (!string) return true;

    // Try to create a URL object
    const url = new URL(string);
    // Valid if protocol is http or https
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
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

export async function successfulPasswordChange() {
  try {
    // Ensure revalidatePath is called correctly.
    // If it's meant to be conditional or needs specific data, adjust accordingly.
    revalidatePath("/dashboard/profile");
    await removeToken();
    // console.log("Post password change actions: Token removed and path revalidated.");
    return {
      success: true,
      message: "Post-password change actions completed successfully.",
    };
  } catch (error) {
    console.error("Error in performPostPasswordChangeActions:", error);
    return {
      success: false,
      error: "Failed to complete post-password change actions.",
    };
  }
}
