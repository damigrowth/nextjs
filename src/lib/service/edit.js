"use server";

import { postData } from "../client/operations";
import { uploadMedia } from "../uploads/upload";
import { EDIT_SERVICE, UPDATE_SERVICE } from "../graphql/mutations";
import { getToken } from "../auth/token";
import { handleMediaUpdate } from "../uploads/update";
import { revalidatePath } from "next/cache";
import { createTags } from "../tags";
import { z } from "zod";

// Custom validator function to check if taxonomy fields have valid IDs
const hasValidId = (field) => {
  if (!field) return false;
  if (field.id === 0 || field.id === "0") return false;
  return true;
};

// Define the service edit validation schema with proper error messages
const SERVICE_EDIT_SCHEMA = z.object({
  title: z
    .string()
    .min(1, "Ο τίτλος είναι απαραίτητος")
    .max(80, "Ο τίτλος δεν μπορεί να υπερβαίνει τους 80 χαρακτήρες")
    .optional(),
  description: z
    .string()
    .min(80, "Η περιγραφή πρέπει να είναι τουλάχιστον 80 χαρακτήρες")
    .max(5000, "Η περιγραφή δεν μπορεί να υπερβαίνει τους 5000 χαρακτήρες")
    .optional(),
  price: z
    .number()
    .min(10, "Η ελάχιστη τιμή είναι 10€")
    .max(50000, "Η μέγιστη τιμή είναι 50000€")
    .optional(),
  status: z.string().optional(),

  // Make category required with proper validation
  category: z.union([
    z
      .object({
        id: z.union([z.string(), z.number()]),
        label: z.string().optional(),
      })
      .refine(hasValidId, {
        message: "Η κατηγορία είναι υποχρεωτική",
        path: ["id"],
      }),
    z.null(),
  ]),

  // Make subcategory required with proper validation
  subcategory: z.union([
    z
      .object({
        id: z.union([z.string(), z.number()]),
        label: z.string().optional(),
      })
      .refine(hasValidId, {
        message: "Η υποκατηγορία είναι υποχρεωτική",
        path: ["id"],
      }),
    z.null(),
  ]),

  // Make subdivision required with proper validation
  subdivision: z.union([
    z
      .object({
        id: z.union([z.string(), z.number()]),
        label: z.string().optional(),
      })
      .refine(hasValidId, {
        message: "Το αντικείμενο είναι υποχρεωτικό",
        path: ["id"],
      }),
    z.null(),
  ]),

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
        title: z
          .string()
          .min(5, "Ο τίτλος πρόσθετου πρέπει να έχει τουλάχιστον 5 χαρακτήρες"),
        description: z
          .string()
          .min(
            10,
            "Η περιγραφή πρόσθετου πρέπει να έχει τουλάχιστον 10 χαρακτήρες"
          ),
        price: z
          .number()
          .min(5, "Η ελάχιστη τιμή είναι 5€")
          .max(10000, "Η μέγιστη τιμή είναι 10000€"),
      })
    )
    .max(3, "Μέγιστος αριθμός πρόσθετων: 3")
    .optional(),

  // Add validation for FAQ
  faq: z
    .array(
      z.object({
        question: z
          .string()
          .min(10, "Η ερώτηση πρέπει να έχει τουλάχιστον 10 χαρακτήρες"),
        answer: z
          .string()
          .min(2, "Η απάντηση πρέπει να έχει τουλάχιστον 2 χαρακτήρες"),
      })
    )
    .max(5, "Μέγιστος αριθμός ερωτήσεων: 5")
    .optional(),
});

export async function editService(prevState, formData) {
  try {
    const changedFields = JSON.parse(formData.get("changes"));
    const serviceId = formData.get("service-id");

    // Special case: check if subcategory is being updated but subdivision is missing or null
    if (
      changedFields.subcategory &&
      changedFields.subcategory.id &&
      (!changedFields.subdivision || changedFields.subdivision === null)
    ) {
      console.log("Subcategory changed but subdivision is missing or null");
      return {
        ...prevState,
        message: "Σφάλμα επικύρωσης",
        errors: {
          field: "subdivision",
          message:
            "Όταν αλλάζετε υποκατηγορία, πρέπει να επιλέξετε αντικείμενο",
        },
        data: null,
      };
    }

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
      console.log("Validation errors:", validationResult.error.format());

      const fieldErrors = {};
      const formattedErrors = validationResult.error.format();

      Object.entries(formattedErrors).forEach(([field, error]) => {
        if (field !== "_errors") {
          // Handle nested errors like category.id
          if (error.id?.[0]) {
            fieldErrors[field] = {
              field,
              message: error.id[0],
            };
          } else if (error._errors?.[0]) {
            // Handle top-level errors
            fieldErrors[field] = {
              field,
              message: error._errors[0],
            };
          }
        }
      });

      return {
        ...prevState,
        message: "Σφάλμα επικύρωσης",
        errors:
          Object.keys(fieldErrors).length > 0
            ? fieldErrors
            : {
                field: "validation",
                message: "Υπάρχουν σφάλματα στη φόρμα",
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

    // Handle taxonomy fields carefully - they're required in the database
    if (category !== undefined) {
      if (category && category.id && category.id !== 0 && category.id !== "0") {
        payload.data.category = category.id;
      } else {
        // Cannot set to null - required field
        // If the user tried to set category to null/invalid, return error
        if (
          changedFields.category === null ||
          (category &&
            (!category.id || category.id === 0 || category.id === "0"))
        ) {
          return {
            ...prevState,
            message: "Σφάλμα επικύρωσης",
            errors: {
              field: "category",
              message: "Η κατηγορία είναι υποχρεωτική",
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
        subcategory.id !== "0"
      ) {
        payload.data.subcategory = subcategory.id;
      } else {
        // Cannot set to null - required field
        // If the user tried to set subcategory to null/invalid, return error
        if (
          changedFields.subcategory === null ||
          (subcategory &&
            (!subcategory.id || subcategory.id === 0 || subcategory.id === "0"))
        ) {
          return {
            ...prevState,
            message: "Σφάλμα επικύρωσης",
            errors: {
              field: "subcategory",
              message: "Η υποκατηγορία είναι υποχρεωτική",
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
        subdivision.id !== "0"
      ) {
        payload.data.subdivision = subdivision.id;
      } else {
        // Cannot set to null - required field
        // If the user tried to set subdivision to null/invalid, return error
        if (
          changedFields.subdivision === null ||
          (subdivision &&
            (!subdivision.id || subdivision.id === 0 || subdivision.id === "0"))
        ) {
          return {
            ...prevState,
            message: "Σφάλμα επικύρωσης",
            errors: {
              field: "subdivision",
              message: "Το αντικείμενο είναι υποχρεωτικό",
            },
            data: null,
          };
        }
      }
    }

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
