'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { postData } from '@/lib/client/operations';
import { UPDATE_FREELANCER } from '@/lib/graphql';

import { presentationSchema } from '../schema/presentation';

export async function updatePresentationInfo(prevState, formData) {
  try {
    const id = formData.get('id');

    const changesJson = formData.get('changes');

    const changes = changesJson ? JSON.parse(changesJson) : {};

    const validateOnly = formData.get('validateOnly') === 'true';

    // Handle explicit error (e.g., from file upload failure)
    if (formData.get('error')) {
      const error = JSON.parse(formData.get('error'));

      return {
        data: null,
        errors: {
          submit: {
            message: error.message || 'Error uploading files',
          },
        },
        message: null,
      };
    }

    // Collect validation errors
    const errors = {};

    // Validate changed fields using presentationSchema
    const fieldsToValidate = {};

    if (changes.website !== undefined)
      fieldsToValidate.website = changes.website;
    if (changes.socials !== undefined)
      fieldsToValidate.socials = changes.socials;
    if (changes.viber !== undefined) fieldsToValidate.viber = changes.viber;
    if (changes.whatsapp !== undefined)
      fieldsToValidate.whatsapp = changes.whatsapp;
    if (changes.phone !== undefined) fieldsToValidate.phone = changes.phone; // Add phone
    if (changes.visibility !== undefined)
      fieldsToValidate.visibility = changes.visibility; // Add visibility

    // Create a partial schema for only the changed fields
    const partialSchema = z.object(
      Object.keys(fieldsToValidate).reduce((acc, field) => {
        if (presentationSchema.shape[field]) {
          acc[field] = presentationSchema.shape[field];
        }

        return acc;
      }, {}),
    );

    const validationResult = partialSchema.safeParse(fieldsToValidate);

    if (!validationResult.success) {
      Object.entries(validationResult.error.flatten().fieldErrors).forEach(
        ([field, messages]) => {
          if (messages && messages.length > 0) {
            errors[field] = { message: messages[0] };
          }
        },
      );
    }
    // Note: The social media URL validation is now implicitly handled by the partialSchema validation above
    // For validation-only requests, check media state if provided
    if (validateOnly && formData.get('mediaState')) {
      // const mediaState = JSON.parse(formData.get('mediaState'));
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
        message: 'Validation passed',
      };
    }

    // Process media updates if needed
    const remainingMedia = formData.get('remaining-media');

    const deletedMedia = formData.get('deleted-media');

    const allMediaDeleted = formData.get('all-media-deleted') === 'true';

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
            message: error.message || 'Error during update',
          },
        },
        message: null,
      };
    }
    // Success - revalidate the path to refresh data
    revalidatePath('/dashboard/profile');

    return {
      data,
      errors: null,
      message: 'Τα στοιχεία ενημερώθηκαν με επιτυχία',
    };
  } catch (error) {
    console.error('Update failed:', error);

    return {
      data: null,
      errors: {
        submit: {
          message: error.message || 'Προέκυψε σφάλμα κατά την ενημέρωση',
        },
      },
      message: null,
    };
  }
}
