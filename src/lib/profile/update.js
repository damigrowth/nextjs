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
  const changedFields = JSON.parse(formData.get("changes"));
  const file = formData.get("image");

  // Validate changed fields
  const partialSchema = z.object(
    Object.keys(changedFields).reduce((acc, field) => {
      acc[field] = basicInfoSchema.shape[field];
      return acc;
    }, {})
  );

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

  // Format the payload
  const payload = {};

  // Handle image upload if it exists in the valid data
  if (file) {
    const uploadedIds = await uploadMedia([file]);
    if (uploadedIds?.length > 0) {
      payload.image = uploadedIds[0];
    }
  }

  // Handle simple fields
  if (validationResult.data.tagline)
    payload.tagline = validationResult.data.tagline;
  if (validationResult.data.description)
    payload.description = validationResult.data.description;
  if (validationResult.data.rate) payload.rate = validationResult.data.rate;
  if (validationResult.data.commencement)
    payload.commencement = validationResult.data.commencement;

  // Handle nested IDs
  if (validationResult.data.category?.data?.id)
    payload.category = validationResult.data.category.data.id;
  if (validationResult.data.subcategory?.data?.id)
    payload.subcategory = validationResult.data.subcategory.data.id;
  if (validationResult.data.skills?.data) {
    payload.skills = validationResult.data.skills.data.map((skill) => skill.id);
  }
  if (validationResult.data.specialization?.data?.id) {
    payload.specialization = validationResult.data.specialization.data.id;
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
        validationResult.data.coverage.counties?.data?.map((el) => el.id) || [],
      areas:
        validationResult.data.coverage.areas?.data?.map((el) => el.id) || [],
    };
  }

  const { data, error } = await postData(UPDATE_FREELANCER, {
    id: formData.get("id"),
    data: payload,
  });

  if (error) {
    return { data: null, errors: { submit: error }, message: null };
  }

  revalidatePath("/dashboard/profile");
  return {
    data: data.updateFreelancer.data,
    errors: null,
    message: "Τα στοιχεία ενημερώθηκαν με επιτυχία",
  };
}

export async function updatePresentationInfo(prevState, formData) {
  const changedFields = JSON.parse(formData.get("changes") || "{}");
  const id = formData.get("id");

  // Validate changed fields using the existing presentation schema
  const partialSchema = z.object(
    Object.keys(changedFields).reduce((acc, field) => {
      acc[field] = presentationSchema.shape[field];
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

  // Prepare the payload
  const payload = {};

  // Add website if changed (following pattern from updateBasicInfo)
  if (validationResult.data.website !== undefined) {
    payload.website = validationResult.data.website;
  }

  // Add visibility if changed (direct assignment like other server actions)
  if (validationResult.data.visibility) {
    payload.visibility = validationResult.data.visibility;
  }

  // Add socials if changed (following pattern from other fields)
  if (validationResult.data.socials) {
    // Create clean socials object with only URL property
    payload.socials = {};

    Object.entries(validationResult.data.socials).forEach(
      ([platform, data]) => {
        if (data && data.url) {
          payload.socials[platform] = { url: data.url.trim() };
        }
      }
    );
  }

  // Handle media update (keep as is since this is a unique case)
  const remainingMediaIds = JSON.parse(formData.get("remaining-media") || "[]");
  const deletedMediaIds = JSON.parse(formData.get("deleted-media") || "[]");
  const files = formData.getAll("media-files");

  const mediaOptions = {
    refId: id,
    ref: "api::freelancer.freelancer",
    field: "portfolio",
    namePrefix: "portfolio",
  };

  if (files.length > 0 || deletedMediaIds.length > 0) {
    const finalMediaIds = await handleMediaUpdate({
      remainingMediaIds,
      files,
      options: mediaOptions,
      deletedMediaIds,
    });

    payload.portfolio = finalMediaIds;
  }

  // Clean empty objects (following pattern from other server actions)
  Object.keys(payload).forEach((key) => {
    if (
      payload[key] === undefined ||
      payload[key] === null ||
      (Array.isArray(payload[key]) && payload[key].length === 0) ||
      (typeof payload[key] === "object" &&
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
    return {
      data: null,
      errors: { submit: error.message },
      message: null,
    };
  }

  revalidatePath("/dashboard/profile");

  return {
    data: gqlData?.updateFreelancer?.data,
    errors: null,
    message: "Τα στοιχεία ενημερώθηκαν με επιτυχία",
  };
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
