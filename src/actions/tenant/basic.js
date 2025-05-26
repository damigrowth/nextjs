'use server';

import { revalidatePath } from 'next/cache';

import { postData } from '@/lib/client/operations';
import { UPDATE_FREELANCER } from '@/lib/graphql';

export async function updateBasicInfo(prevState, formData) {
  try {
    const id = formData.get('id');

    const changedFields = JSON.parse(formData.get('changes') || '{}');

    const currentFormState = JSON.parse(
      formData.get('currentFormState') || '{}',
    );

    const validateOnly = formData.get('validateOnly') === 'true';

    // We don't need to fetch the freelancer - we already have the current state
    // Handle explicit error (e.g., from image upload failure)
    if (formData.get('error')) {
      const error = JSON.parse(formData.get('error'));

      return {
        data: null,
        errors: {
          // Make sure error has the exact expected structure
          image: {
            field: 'image',
            message: error.message || 'Error uploading image',
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
    if (changedFields.tagline === '') {
      validationState.tagline = '';
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
        field: 'image',
        message: 'Η εικόνα προφίλ είναι υποχρεωτική',
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
        field: 'coverage',
        message: 'Πρέπει να επιλέξετε τουλάχιστον έναν τρόπο κάλυψης',
      };
    }
    // 2. Check onbase requirements if selected
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
          field: 'counties',
          message:
            'Απαιτείται τουλάχιστον ένας νομός ή μια περιοχή για κάλυψη στον χώρο του πελάτη',
        };
      }
    }

    // 4. Check required category/subcategory
    const existingCategory = currentFormState.category?.data?.id;

    const existingSubcategory = currentFormState.subcategory?.data?.id;

    // Category is required if not previously set
    if (!existingCategory && !validationState.category?.data?.id) {
      errors.category = {
        field: 'category',
        message: 'Η κατηγορία είναι υποχρεωτική',
      };
    }
    // Subcategory is required if not previously set
    if (!existingSubcategory && !validationState.subcategory?.data?.id) {
      errors.subcategory = {
        field: 'subcategory',
        message: 'Η υποκατηγορία είναι υποχρεωτική',
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
        message: 'Validation passed',
      };
    }

    // Prepare payload with only changed fields
    const payload = {};

    const changes = new Set(Object.keys(changedFields));

    // Handle image if it exists in state (uploaded from client)
    if (currentFormState.image?.data?.id) {
      // Only add image to payload if we have a valid ID
      payload.image = currentFormState.image.data.id;
    } else if (changes.has('image')) {
      // If image is being explicitly changed to null, set it to null
      payload.image = null;
    }
    // Add validated changes to payload
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
        // Handle skills array
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
    // Before making the API call, check if payload is empty
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
            field: 'submit',
            message: error.message || 'Error during update',
          },
        },
        message: null,
      };
    }
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
          field: 'submit',
          message: error.message || 'Προέκυψε σφάλμα κατά την ενημέρωση',
        },
      },
      message: null,
    };
  }
}
