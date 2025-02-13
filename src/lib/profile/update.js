"use server";

import { z } from "zod";
import { postData } from "../client/operations";
import { UPDATE_FREELANCER } from "../graphql/mutations";
import { revalidatePath } from "next/cache";
import { accountSchema, basicInfoSchema } from "./validation";
import { uploadMedia } from "../uploads/upload";

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

export async function updatePresentationInfo(prevState, formData) {}

export async function updateAdditionalInfo(prevState, formData) {}
