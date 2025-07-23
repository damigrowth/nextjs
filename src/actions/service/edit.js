'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { postData } from '@/lib/client/operations';
import { EDIT_SERVICE } from '@/lib/graphql';
import { createTags } from '../shared/tags';
import { serviceEditSchema } from '@/lib/validations';

export async function editService(prevState, formData) {
  try {
    const changedFields = JSON.parse(formData.get('changes'));
    const serviceId = formData.get('service-id');

    // Special case: check if subcategory is being updated but subdivision is missing or null
    if (
      changedFields.subcategory &&
      changedFields.subcategory.id &&
      (!changedFields.subdivision || changedFields.subdivision === null)
    ) {
      console.log('Subcategory changed but subdivision is missing or null');

      return {
        ...prevState,
        message: 'Σφάλμα επικύρωσης',
        errors: {
          field: 'subdivision',
          message:
            'Όταν αλλάζετε υποκατηγορία, πρέπει να επιλέξετε αντικείμενο',
        },
        data: null,
      };
    }

    // Create a partial schema based on changed fields
    const partialSchema = z.object(
      Object.keys(changedFields).reduce((acc, field) => {
        if (serviceEditSchema.shape[field]) {
          acc[field] = serviceEditSchema.shape[field];
        }
        return acc;
      }, {}),
    );

    // Validate only changed fields
    const validationResult = partialSchema.safeParse(changedFields);

    if (!validationResult.success) {
      console.log('Validation errors:', validationResult.error.format());

      const formattedErrors = validationResult.error.format();

      // Find the first field with an error
      const firstErrorField = Object.keys(formattedErrors).find(
        (field) =>
          field !== '_errors' &&
          (formattedErrors[field]._errors?.length > 0 ||
            formattedErrors[field].id?.[0]),
      );

      if (firstErrorField) {
        const errorMessage =
          formattedErrors[firstErrorField].id?.[0] ||
          formattedErrors[firstErrorField]._errors[0];

        return {
          ...prevState,
          message: 'Σφάλμα επικύρωσης',
          errors: {
            field: firstErrorField,
            message: errorMessage,
          },
          data: null,
        };
      }

      return {
        ...prevState,
        message: 'Σφάλμα επικύρωσης',
        errors: {
          field: 'validation',
          message: 'Υπάρχουν σφάλματα στη φόρμα',
        },
        data: null,
      };
    }

    const {
      title,
      description,
      price,
      status,
      category,
      subcategory,
      subdivision,
      tags,
      addons,
      faq,
    } = validationResult.data;

    // Separate existing and new tags
    const existingTags = tags
      ? tags
          .filter((tag) => !tag.isNewTerm && !tag.id.startsWith('new-'))
          .map((tag) => ({
            id: tag.id,
            label: tag.label || tag.data?.attributes?.label || '',
            ...(tag.attributes ? { attributes: tag.attributes } : {}),
            ...(tag.data ? { data: tag.data } : {}),
          }))
      : [];

    const newTags = tags
      ? tags.filter((tag) => tag.isNewTerm || tag.id.startsWith('new-'))
      : [];

    // Create new tags if any exist
    let allTagIds = existingTags.map((tag) => tag.id);
    let fullTagsData = [...existingTags];

    if (newTags.length > 0) {
      const result = await createTags(newTags);

      if (result.error) {
        return {
          ...prevState,
          message: result.error, // ✅ Use result.error (Greek string)
          errors: result.error, // ✅ Consistent format
          data: null,
        };
      }
      allTagIds = [...allTagIds, ...result.data.map((tag) => tag.id)];
      fullTagsData = [
        ...fullTagsData,
        ...result.data.map((tag) => ({
          id: tag.id,
          label: tag.attributes?.label || '',
          data: tag,
          attributes: tag.attributes || null,
        })),
      ];
    }

    // Get media IDs from client
    const finalMediaIds = formData.has('remaining-media')
      ? JSON.parse(formData.get('remaining-media') || '[]')
      : undefined;

    // Prepare update payload with only changed fields
    const payload = {
      id: serviceId,
      data: {},
    };

    // Add text fields and taxonomy fields
    if (title !== undefined) payload.data.title = title;
    if (description !== undefined) payload.data.description = description;
    if (price !== undefined) payload.data.price = price;
    if (status !== undefined) payload.data.status = status === 'Active' ? 1 : 2;

    // Handle taxonomy fields carefully - they're required in the database
    if (category !== undefined) {
      if (category && category.id && category.id !== 0 && category.id !== '0') {
        payload.data.category = category.id;
      } else {
        if (
          changedFields.category === null ||
          (category &&
            (!category.id || category.id === 0 || category.id === '0'))
        ) {
          return {
            ...prevState,
            message: 'Σφάλμα επικύρωσης',
            errors: {
              field: 'category',
              message: 'Η κατηγορία είναι υποχρεωτική',
            },
            data: null,
          };
        }
      }
    }

    if (subcategory !== undefined) {
      if (
        subcategory &&
        subcategory.id &&
        subcategory.id !== 0 &&
        subcategory.id !== '0'
      ) {
        payload.data.subcategory = subcategory.id;
      } else {
        if (
          changedFields.subcategory === null ||
          (subcategory &&
            (!subcategory.id || subcategory.id === 0 || subcategory.id === '0'))
        ) {
          return {
            ...prevState,
            message: 'Σφάλμα επικύρωσης',
            errors: {
              field: 'subcategory',
              message: 'Η υποκατηγορία είναι υποχρεωτική',
            },
            data: null,
          };
        }
      }
    }

    if (subdivision !== undefined) {
      if (
        subdivision &&
        subdivision.id &&
        subdivision.id !== 0 &&
        subdivision.id !== '0'
      ) {
        payload.data.subdivision = subdivision.id;
      } else {
        if (
          changedFields.subdivision === null ||
          (subdivision &&
            (!subdivision.id || subdivision.id === 0 || subdivision.id === '0'))
        ) {
          return {
            ...prevState,
            message: 'Σφάλμα επικύρωσης',
            errors: {
              field: 'subdivision',
              message: 'Το αντικείμενο είναι υποχρεωτικό',
            },
            data: null,
          };
        }
      }
    }

    // Include tag IDs for the API
    if (allTagIds !== undefined && allTagIds.length > 0) {
      payload.data.tags = allTagIds;
      payload.fullTagsData = fullTagsData;
    }

    // Include media IDs if they've changed
    if (finalMediaIds !== undefined) {
      payload.data.media = finalMediaIds;
    }

    // Include addons and FAQ if they've changed
    if (addons !== undefined) payload.data.addons = addons;
    if (faq !== undefined) payload.data.faq = faq;

    // Make the API request
    const response = await postData(EDIT_SERVICE, payload);

    // ✅ Check for SUCCESS first
    if (response?.data?.updateService?.data) {
      revalidatePath(`/dashboard/services/edit/${serviceId}`);

      return {
        ...prevState,
        message: 'Η ενημέρωση υπηρεσίας ολοκληρώθηκε επιτυχώς!',
        errors: null,
        data: response.data.updateService.data,
      };
    }

    // ✅ Handle ERRORS
    if (response?.error) {
      return {
        ...prevState,
        message: response.error, // ✅ Greek error message from postData
        errors: response.error, // ✅ Consistent format
        data: null,
      };
    }

    // ✅ Fallback if no data and no error (shouldn't happen)
    return {
      ...prevState,
      message: 'Η ενημέρωση υπηρεσίας απέτυχε - παρακαλώ προσπαθήστε ξανά.',
      errors: 'Η ενημέρωση υπηρεσίας απέτυχε - παρακαλώ προσπαθήστε ξανά.',
      data: null,
    };
  } catch (error) {
    // ✅ Safety net with Greek message
    console.error('Edit service error:', error);

    return {
      ...prevState,
      message: 'Προέκυψε απροσδόκητο σφάλμα κατά την ενημέρωση υπηρεσίας.',
      errors: 'Προέκυψε απροσδόκητο σφάλμα κατά την ενημέρωση υπηρεσίας.',
      data: null,
    };
  }
}
