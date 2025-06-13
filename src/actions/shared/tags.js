'use server';

import { getData, postData } from '@/lib/client/operations';
import { CREATE_TAG, DRAFT_TAG } from '@/lib/graphql';
import { createSlug } from '@/utils/slug';

export async function createTags(tags) {
  try {
    let createdTags = [];

    for (const tag of tags) {
      try {
        const slug = createSlug(tag.label);

        // Check if tag exists by slug
        const existingTag = await getData(DRAFT_TAG, { slug });

        if (existingTag?.tags?.data?.[0]?.id) {
          // If tag exists, add it to createdTags and continue
          createdTags.push({
            id: existingTag.tags.data[0].id,
            label: tag.label,
          });
          continue;
        }

        // If tag doesn't exist, create it
        const payload = {
          data: {
            label: tag.label,
            slug,
          },
        };

        const response = await postData(CREATE_TAG, payload);

        // ✅ Handle ERRORS from postData (Greek messages)
        if (response?.error) {
          return {
            error: true,
            message: response.error, // Greek error message from postData
          };
        }

        // ✅ Check SUCCESS
        if (response?.data?.createTag?.data?.id) {
          createdTags.push({
            id: response.data.createTag.data.id,
            label: response.data.createTag.data.attributes.label,
          });
        } else {
          // ✅ Fallback if no data and no error
          return {
            error: true,
            message: `Το tag "${tag.label}" δεν μπόρεσε να δημιουργηθεί.`,
          };
        }
      } catch (error) {
        if (error.message?.includes('unique')) {
          return {
            error: true,
            message: `Το tag "${tag.label}" υπάρχει ήδη στο σύστημα.`,
          };
        }
        throw error;
      }
    }

    return {
      error: false,
      data: createdTags,
    };
  } catch (error) {
    console.error('Error creating tags:', error);

    return {
      error: true,
      message: 'Υπήρξε ένα πρόβλημα κατά τη δημιουργία των tags.',
    };
  }
}
