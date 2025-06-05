'use server';

import { redirect } from 'next/navigation';

import { postData } from '@/lib/client/operations';
import { UPDATE_FREELANCER } from '@/lib/graphql';

import {
  OnboardingFormSchema,
  OnboardingFormSchemaWithMedia,
} from '../schema/onboarding';
import { updateFreelancerStatus } from './status';
import { getFreelancerId } from '../shared/freelancer';

/**
 * Server action to update freelancer onboarding information.
 * Handles validation, data submission, and error/success responses.
 *
 * @param {object} prevState - The previous state of the form (from useActionState).
 * @param {FormData} formData - The form data submitted.
 * @returns {Promise<object>} The form state with data, errors, or a message.
 */
export async function updateOnboardingInfo(prevState, formData) {
  const id = formData.get('id');

  // CRITICAL SECURITY: Validate that the freelancer ID matches the authenticated user
  const authenticatedFreelancerId = await getFreelancerId();
  
  if (!authenticatedFreelancerId) {
    console.error('SECURITY_ALERT: No authenticated freelancer ID found');
    return {
      data: null,
      errors: {
        submit: {
          field: 'submit',
          message: 'Σφάλμα ταυτοποίησης χρήστη',
        },
      },
      message: null,
    };
  }

  if (String(id) !== String(authenticatedFreelancerId)) {
    console.error('CRITICAL_SECURITY_ALERT: Freelancer ID mismatch in onboarding!', {
      requestedFreelancerId: id,
      authenticatedFreelancerId: authenticatedFreelancerId,
      timestamp: Date.now()
    });

    // Log this critical security issue
    try {
      await fetch('/api/security/log-mismatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ONBOARDING_FREELANCER_ID_MISMATCH',
          requestedFreelancerId: id,
          authenticatedFreelancerId: authenticatedFreelancerId,
          timestamp: Date.now(),
        }),
      }).catch(() => {}); // Silent fail for logging
    } catch {}

    return {
      data: null,
      errors: {
        submit: {
          field: 'submit',
          message: 'Σφάλμα ταυτοποίησης - παρακαλώ συνδεθείτε ξανά',
        },
      },
      message: null,
    };
  }

  const validateOnly = formData.get('validateOnly') === 'true';

  const changesString = formData.get('changes');

  const mediaStateString = formData.get('mediaState');

  const allMediaDeleted = formData.get('all-media-deleted') === 'true';

  const remainingMediaIdsString = formData.get('remaining-media');

  const errorFromClient = formData.get('error');

  const onboardingComplete = formData.get('onboardingComplete') === 'true';

  // Handle explicit error from client (e.g., image/file upload failure)
  if (errorFromClient) {
    const error = JSON.parse(errorFromClient);

    return {
      data: null,
      errors: {
        // Make sure error has the exact expected structure (same as basic.js)
        image: {
          field: 'image',
          message: error.message || 'Error uploading image',
        },
      },
      message: null,
    };
  }

  const changedFields = changesString ? JSON.parse(changesString) : {};

  const mediaState = mediaStateString ? JSON.parse(mediaStateString) : null;

  const remainingMediaIds = remainingMediaIdsString
    ? JSON.parse(remainingMediaIdsString)
    : [];

  const currentFormState = JSON.parse(formData.get('currentFormState') || '{}');

  // Determine which schema to use based on media changes
  const schema =
    mediaState && (mediaState.hasNewMedia || mediaState.hasDeletedMedia)
      ? OnboardingFormSchemaWithMedia
      : OnboardingFormSchema;

  // Create merged validation state, exactly as in basic.js
  let validationState = {
    ...currentFormState,
    ...changedFields,
  };

  // Ensure coverage is properly merged, exactly as in basic.js
  if (validationState.coverage || changedFields.coverage) {
    validationState.coverage = {
      ...(currentFormState.coverage || {}),
      ...(changedFields.coverage || {}),
    };
  }

  // Add media state properties for validation if schema includes them
  if (schema === OnboardingFormSchemaWithMedia && mediaState) {
    validationState.mediaCount = mediaState.mediaCount;
    validationState.hasNewMedia = mediaState.hasNewMedia;
    validationState.hasDeletedMedia = mediaState.hasDeletedMedia;
  }

  // Create an errors object to collect all validation errors
  const errors = {};

  // IMPORTANT: Always validate ALL required fields, not just changed ones (from basic.js)
  // 0. Check if image is required (only if not set previously)
  const existingImage = currentFormState.image?.data?.id;

  const isImageProvided = !!(
    validationState.image?.data?.id || validationState.image?.isNewFile
  );

  if (!existingImage && !isImageProvided) {
    errors.image = {
      field: 'image',
      message: 'Η εικόνα προφίλ είναι υποχρεωτική',
    };
  }

  // 1. Validate category and subcategory
  if (!validationState.category?.data?.id) {
    errors.category = {
      field: 'category',
      message: 'Η κατηγορία είναι υποχρεωτική',
    };
  }
  if (!validationState.subcategory?.data?.id) {
    errors.subcategory = {
      field: 'subcategory',
      message: 'Η υποκατηγορία είναι υποχρεωτική',
    };
  }

  // 2. Validate description
  if (!validationState.description?.trim()) {
    errors.description = {
      field: 'description',
      message: 'Η περιγραφή είναι υποχρεωτική',
    };
  } else if (validationState.description.length < 80) {
    errors.description = {
      field: 'description',
      message: 'Η περιγραφή πρέπει να είναι τουλάχιστον 80 χαρακτήρες.',
    };
  } else if (validationState.description.length > 5000) {
    errors.description = {
      field: 'description',
      message: 'Η περιγραφή δεν μπορεί να υπερβαίνει τους 5000 χαρακτήρες.',
    };
  }

  // 3. Validate coverage (same as basic.js)
  if (
    !validationState.coverage ||
    (!validationState.coverage.online &&
      !validationState.coverage.onbase &&
      !validationState.coverage.onsite)
  ) {
    errors.coverage = {
      field: 'coverage',
      message: 'Πρέπει να επιλέξετε τουλάχιστον έναν τρόπο κάλυψης',
    };
  }
  // Check onbase requirements if selected (same as basic.js)
  if (validationState.coverage?.onbase) {
    if (!validationState.coverage.address?.trim()) {
      errors.address = {
        field: 'address',
        message: 'Η διεύθυνση είναι υποχρεωτική για κάλυψη στον χώρο σας',
      };
    }
    if (!validationState.coverage.zipcode?.data?.id) {
      errors.zipcode = {
        field: 'zipcode',
        message: 'Ο Τ.Κ. είναι υποχρεωτικός για κάλυψη στον χώρο σας',
      };
    }
    if (!validationState.coverage.county?.data?.id) {
      errors.county = {
        field: 'county',
        message: 'Ο νομός είναι υποχρεωτικός για κάλυψη στον χώρο σας',
      };
    }
    if (!validationState.coverage.area?.data?.id) {
      errors.area = {
        field: 'area',
        message: 'Η περιοχή είναι υποχρεωτική για κάλυψη στον χώρο σας',
      };
    }
  }
  // Check onsite requirements if selected (same as basic.js)
  if (validationState.coverage?.onsite) {
    const hasCounties =
      Array.isArray(validationState.coverage.counties?.data) &&
      validationState.coverage.counties.data.length > 0;

    const hasAreas =
      Array.isArray(validationState.coverage.areas?.data) &&
      validationState.coverage.areas.data.length > 0;

    if (!hasCounties && !hasAreas) {
      errors.counties = {
        field: 'counties',
        message:
          'Απαιτείται τουλάχιστον ένας νομός ή μια περιοχή για κάλυψη στον χώρο του πελάτη',
      };
    }
  }

  // If there are validation errors, return them (same as basic.js - no Zod validation)
  if (Object.keys(errors).length > 0) {
    return {
      data: null,
      errors,
      message: null,
    };
  }

  if (validateOnly) {
    return {
      data: null,
      errors: {},
      message: null,
    };
  }

  // Prepare the final payload for the API call (same pattern as basic.js)
  const payload = {};

  // Convert changedFields to Set for consistency with basic.js pattern
  const changes = new Set(Object.keys(changedFields));

  // Handle image if it exists in state (uploaded from client), exactly as in basic.js
  if (currentFormState.image?.data?.id) {
    // Only add image to payload if we have a valid ID
    payload.image = currentFormState.image.data.id;
  } else if (changes.has('image')) {
    // If image is being explicitly changed to null, set it to null
    payload.image = null;
  }

  // Add validated changes to payload (same pattern as basic.js)
  for (const field of changes) {
    if (field === 'image') {
      // Skip image as we've handled it separately
      continue;
    }
    if (field in validationState) {
      if (field === 'coverage') {
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
        field === 'category' ||
        field === 'subcategory' ||
        field === 'specialization'
      ) {
        payload[field] = validationState[field].data?.id || null;
      }
      // Handle skills array (keep for consistency, even if not in onboarding form)
      else if (field === 'skills') {
        payload[field] = (validationState[field].data || []).map(
          (item) => item.id,
        );
      } else if (field !== 'rate' && field !== 'commencement') {
        // Exclude rate and commencement
        payload[field] = validationState[field];
      }
    }
  }

  // Portfolio (from presentation.js pattern)
  if (mediaState && (mediaState.hasNewMedia || mediaState.hasDeletedMedia)) {
    if (allMediaDeleted) {
      payload.portfolio = [];
    } else {
      payload.portfolio = remainingMediaIds;
    }
  }

  // Before making the API call, check if payload is empty (same as basic.js)
  if (Object.keys(payload).length === 0) {
    return {
      data: null,
      errors: {
        submit: {
          field: 'submit',
          message: 'No changes to save',
        },
      },
      message: null,
    };
  }

  // API call (same pattern as basic.js)
  const { data, error } = await postData(UPDATE_FREELANCER, {
    id,
    data: payload,
  });

  if (error) {
    return {
      data: null,
      errors: {
        submit: {
          field: 'submit',
          message: error.message || 'Error during update',
        },
      },
      message: null,
    };
  }

  // If onboarding is complete, update status as well
  if (onboardingComplete) {
    try {
      await updateFreelancerStatus(id);
    } catch (statusError) {
      console.error('Status update failed:', statusError);

      // Return success for profile update but note status update failed
      return {
        data,
        errors: {
          submit: {
            field: 'submit',
            message:
              'Το προφίλ ενημερώθηκε αλλά υπήρξε πρόβλημα με την ενεργοποίηση',
          },
        },
        message: null,
      };
    }
  }

  redirect('/dashboard/start/success');
}
