'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { postData } from '@/lib/client/operations';
import { UPDATE_FREELANCER } from '@/lib/graphql';

import { additionalInfoSchema } from '../schema/additional';

export async function updateAdditionalInfo(prevState, formData) {
  const id = formData.get('id');

  const changedFieldsRaw = JSON.parse(formData.get('changes'));

  // Prepare data for validation by transforming nested data structures
  const changedFields = { ...changedFieldsRaw };

  delete changedFields.id;
  // Transform changed fields with nested data structure
  [
    'contactTypes',
    'payment_methods',
    'settlement_methods',
    'industries',
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
  // Handle terms, rate, and commencement separately since they are simple fields
  if (changedFields.terms !== undefined) {
    changedFields.terms = formData.get('terms'); // Assuming terms is still passed via formData if needed, otherwise use changedFieldsRaw
  }
  if (changedFields.rate !== undefined) {
    // Use the value already processed in getChangedFields
    changedFields.rate = changedFieldsRaw.rate;
  }
  if (changedFields.commencement !== undefined) {
    // Use the value already processed in getChangedFields
    changedFields.commencement = changedFieldsRaw.commencement;
  }

  // Create schema for only the changed fields
  const partialSchema = z.object(
    Object.keys(changedFields).reduce((acc, field) => {
      acc[field] = additionalInfoSchema.shape[field];

      return acc;
    }, {}),
  );

  // Validate the changed fields
  const validationResult = partialSchema.safeParse(changedFields);

  if (!validationResult.success) {
    return {
      data: null,
      errors: Object.fromEntries(
        Object.entries(validationResult.error.flatten().fieldErrors)
          .filter(([, messages]) => messages?.length > 0)
          .map(([field, messages]) => [field, { field, message: messages[0] }]),
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
  // Handle rate field
  if (validationResult.data.rate !== undefined) {
    payload.rate = validationResult.data.rate;
  }
  // Handle commencement field
  if (validationResult.data.commencement !== undefined) {
    payload.commencement = validationResult.data.commencement;
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
    'contactTypes',
    'payment_methods',
    'settlement_methods',
    'industries',
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
  revalidatePath('/dashboard/profile');

  return {
    data: data.updateFreelancer.data,
    errors: null,
    message: 'Τα στοιχεία ενημερώθηκαν με επιτυχία',
  };
}
