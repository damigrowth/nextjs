"use server";

import { postData } from "../client/operations";
import { uploadMedia } from "../uploads/upload";
import { EDIT_SERVICE, UPDATE_SERVICE } from "../graphql/mutations";
import { getToken } from "../auth/token";
import { handleMediaUpdate } from "../uploads/update";
import { revalidatePath } from "next/cache";
import { createTags } from "../tags";
import { z } from "zod";

// Define the service edit validation schema with more flexibility
const SERVICE_EDIT_SCHEMA = z.object({
  title: z.string().min(1).max(80).optional(),
  description: z.string().min(80).max(5000).optional(),
  price: z.number().min(10).max(50000).optional(),
  status: z.string().optional(),
  // Make category, subcategory, and subdivision more flexible
  category: z
    .union([
      z.object({
        id: z.union([z.string(), z.number()]),
        label: z.string().optional(),
      }),
      z.null(),
    ])
    .optional(),
  subcategory: z
    .union([
      z.object({
        id: z.union([z.string(), z.number()]),
        label: z.string().optional(),
      }),
      z.null(),
    ])
    .optional(),
  subdivision: z
    .union([
      z.object({
        id: z.union([z.string(), z.number()]),
        label: z.string().optional(),
      }),
      z.null(),
    ])
    .optional(),
  // Make tags more flexible
  tags: z
    .array(
      z.object({
        id: z.string(),
        label: z.string().optional(),
        isNewTerm: z.boolean().optional(),
        // Allow data and attributes to be passed
        data: z.any().optional(),
        attributes: z.any().optional(),
      })
    )
    .optional(),
  // Add validation for addons
  addons: z
    .array(
      z.object({
        title: z.string().min(5),
        description: z.string().min(10),
        price: z.number().min(5).max(10000),
      })
    )
    .max(3)
    .optional(),
  // Add validation for FAQ
  faq: z
    .array(
      z.object({
        question: z.string().min(10),
        answer: z.string().min(2),
      })
    )
    .max(5)
    .optional(),
});

export async function editService(prevState, formData) {
  try {
    const changedFields = JSON.parse(formData.get("changes"));
    const serviceId = formData.get("service-id");

    // Create a partial schema based on changed fields
    const partialSchema = z.object(
      Object.keys(changedFields).reduce((acc, field) => {
        // Get the schema for this field from our SERVICE_EDIT_SCHEMA
        if (SERVICE_EDIT_SCHEMA.shape[field]) {
          acc[field] = SERVICE_EDIT_SCHEMA.shape[field];
        }
        return acc;
      }, {})
    );

    // Validate only changed fields
    const validationResult = partialSchema.safeParse(changedFields);

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
        ...prevState,
        message: "Validation errors",
        errors: fieldErrors,
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
          .filter((tag) => !tag.isNewTerm && !tag.id.startsWith("new-"))
          .map((tag) => ({
            id: tag.id,
            // Preserve label data
            label: tag.label || tag.data?.attributes?.label || "",
            // Keep any additional attributes
            ...(tag.attributes ? { attributes: tag.attributes } : {}),
            ...(tag.data ? { data: tag.data } : {}),
          }))
      : [];

    const newTags = tags
      ? tags.filter((tag) => tag.isNewTerm || tag.id.startsWith("new-"))
      : [];

    // Create new tags if any exist
    let allTagIds = existingTags.map((tag) => tag.id);
    // For payload construction, keep a full tags array with complete data
    let fullTagsData = [...existingTags];

    if (newTags.length > 0) {
      const result = await createTags(newTags);

      if (result.error) {
        return {
          ...prevState,
          message: result.message,
          errors: result.message,
          data: null,
        };
      }

      // Add new tag IDs to the list
      allTagIds = [...allTagIds, ...result.data.map((tag) => tag.id)];
      // Add complete new tag data to the full tags array
      fullTagsData = [
        ...fullTagsData,
        ...result.data.map((tag) => ({
          id: tag.id,
          label: tag.attributes?.label || "",
          data: tag,
          attributes: tag.attributes || null,
        })),
      ];
    }

    // Handle media
    let finalMediaIds = undefined;
    const hasMediaFiles = formData.has("media-files");
    const hasRemainingMedia = formData.has("remaining-media");
    const hasDeletedMedia = formData.has("deleted-media");

    // Check if any media-related fields exist in the form data
    if (hasMediaFiles || hasRemainingMedia || hasDeletedMedia) {

      const remainingMediaIds = JSON.parse(
        formData.get("remaining-media") || "[]"
      );
      const files = formData.getAll("media-files");
      const deletedIds = JSON.parse(formData.get("deleted-media") || "[]");

      // Prepare media options
      const mediaOptions = {
        refId: serviceId,
        ref: "api::service.service",
        field: "media",
        namePrefix: "service",
      };

      try {
        // Handle media update with deduplication
        finalMediaIds = await handleMediaUpdate({
          remainingMediaIds,
          files,
          options: mediaOptions,
        });

      } catch (error) {
        console.error("Media update error:", error);
        return {
          ...prevState,
          message: "Error updating media: " + error.message,
          errors: { media: error.message },
          data: null,
        };
      }
    }

    // Prepare update payload with only changed fields
    const payload = {
      id: serviceId,
      data: {},
    };

    // Add text fields and taxonomy fields
    if (title !== undefined) payload.data.title = title;
    if (description !== undefined) payload.data.description = description;
    if (price !== undefined) payload.data.price = price;
    if (status !== undefined) payload.data.status = status === "Active" ? 1 : 2;
    if (category !== undefined) payload.data.category = category?.id || null;
    if (subcategory !== undefined)
      payload.data.subcategory = subcategory?.id || null;
    if (subdivision !== undefined)
      payload.data.subdivision = subdivision?.id || null;

    // Include tag IDs for the API
    if (allTagIds !== undefined && allTagIds.length > 0) {
      payload.data.tags = allTagIds;
      // We can also store the full tags data if needed for the response
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

    if (!response?.data?.updateService?.data) {
      console.error("API error:", response);
      return {
        ...prevState,
        message: "Η ενημέρωση υπηρεσίας απέτυχε!",
        errors: response,
        data: null,
      };
    }

    // Revalidate edit service page
    revalidatePath(`/dashboard/services/edit/${serviceId}`);

    return {
      ...prevState,
      message: "Η ενημέρωση υπηρεσίας ολοκληρώθηκε επιτυχώς!",
      errors: null,
      data: response.data.updateService.data,
    };
  } catch (error) {
    console.error(error);
    return {
      errors: error?.message,
      message: "Server error. Please try again later.",
      data: null,
    };
  }
}
