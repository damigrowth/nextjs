'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { z } from 'zod';

import { postData } from '@/lib/client/operations';
import { UPDATE_FREELANCER } from '@/lib/graphql';

import { accountSchema } from '../schema/account';

export async function updateAccountInfo(prevState, formData) {
  const changedFields = JSON.parse(formData.get('changes'));

  const currentFormState = JSON.parse(formData.get('currentFormState') || '{}'); // Get current state

  const type = formData.get('type'); // Get type

  const isUser = type === 'user';

  const validateOnly = formData.get('validateOnly') === 'true'; // Check for validation-only requests

  // Handle explicit error from client (e.g., image upload failure)
  if (formData.get('error')) {
    const error = JSON.parse(formData.get('error'));

    const errors = {};

    if (isUser) {
      // Only add image error if it's a user
      errors.image = {
        field: 'image',
        message: error.message || 'Error processing image',
      };
    }
    errors.submit = {
      // Add a general submit error too
      field: 'submit',
      message: error.message || 'Error processing request',
    };

    return {
      data: null,
      errors: errors,
      message: null,
    };
  }

  // --- Start Simplified Validation ---
  // 1. Schema for non-image fields only (phone is already removed from accountSchema)
  const nonImageSchemaFields = { ...accountSchema.shape };

  delete nonImageSchemaFields.image; // Ensure image is not in the base schema

  // 2. Create partial schema for changed non-image fields
  const partialNonImageSchema = z.object(
    Object.keys(changedFields).reduce((acc, field) => {
      // Only include non-image fields that are in accountSchema (phone is already removed)
      if (nonImageSchemaFields[field] && field !== 'image') {
        acc[field] = nonImageSchemaFields[field];
      }

      return acc;
    }, {}),
  );

  // 3. Prepare data for non-image validation (only changed non-image fields)
  const nonImageDataToValidate = { ...changedFields };

  delete nonImageDataToValidate.image; // Remove image before validation

  // 4. Validate non-image fields
  const nonImageValidationResult = partialNonImageSchema.safeParse(
    nonImageDataToValidate,
  );

  // 5. Return errors if non-image validation failed
  if (!nonImageValidationResult.success) {
    const fieldErrors = {};

    Object.entries(
      nonImageValidationResult.error.flatten().fieldErrors,
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
      message: 'Validation passed', // Or null if preferred
    };
  }

  // --- Start Simplified Payload Preparation ---
  // Prepare payload for API: Start with validated non-image data
  const payload = { ...nonImageValidationResult.data }; // Use data from successful non-image validation

  // Conditionally add the image ID directly to the payload if it's a user
  // Check if the image field was part of the intended changes OR if it exists in the final state
  if (
    isUser &&
    (Object.hasOwn(changedFields, 'image') ||
      currentFormState.image !== undefined)
  ) {
    const imageId = currentFormState.image?.data?.id;

    // Add the image field to the payload with the direct ID or null
    payload.image = imageId || null;
  }

  // --- End Simplified Payload Preparation ---
  // API call
  const response = await postData(UPDATE_FREELANCER, {
    id: formData.get('id'),
    data: payload, // Send the final payload
  });

  // ✅ Check SUCCESS first
  if (response?.data?.updateFreelancer?.data) {
    revalidatePath('/dashboard/profile');
    revalidateTag('freelancer'); // Refresh UserMenu across site
    return {
      data: response.data.updateFreelancer.data,
      errors: null,
      message: 'Τα στοιχεία ενημερώθηκαν με επιτυχία',
    };
  }

  // ✅ Handle ERRORS from postData (Greek messages)
  if (response?.error) {
    return {
      data: null,
      errors: {
        submit: {
          field: 'submit',
          message: response.error, // Greek error message from postData
        },
      },
      message: null,
    };
  }

  // ✅ Fallback if no data and no error
  return {
    data: null,
    errors: {
      submit: {
        field: 'submit',
        message: 'Αποτυχία ενημέρωσης. Δοκιμάστε ξανά.',
      },
    },
    message: null,
  };
}
