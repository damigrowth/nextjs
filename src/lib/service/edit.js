"use server";

import { postData } from "../client/operations";
import { uploadMedia } from "../uploads/upload";
import { EDIT_SERVICE, UPDATE_SERVICE } from "../graphql/mutations";
import { getToken } from "../auth/token";
import { handleMediaUpdate } from "../uploads/update";
import { revalidatePath } from "next/cache";
import { createTags } from "../tags";

export async function editService(prevState, formData) {
  // const jwt = await getToken();
  // console.log("jwt", jwt);

  try {
    // Parse basic form fields
    const serviceId = formData.get("service-id");
    const title = formData.get("service-title");
    const description = formData.get("service-description");
    const price = parseFloat(formData.get("service-price"));
    const status = formData.get("status");
    const addons = JSON.parse(formData.get("addons"));
    const faq = JSON.parse(formData.get("faq"));

    // Parse taxonomy fields
    const categoryId = parseInt(formData.get("service-category"));
    const subcategoryId = parseInt(formData.get("service-subcategory"));
    const subdivisionId = parseInt(formData.get("service-subdivision"));

    // Get all tag values from formData - the last one is the complete JSON string
    const tagValues = formData.getAll("service-tags");
    // Get the last entry which contains the full JSON string of all tags
    const tagJsonString = tagValues[tagValues.length - 1];
    const tags = JSON.parse(tagJsonString || "[]");

    // Separate existing and new tags
    const existingTags = tags
      .filter((tag) => !tag.isNewTerm && !tag.id.startsWith("new-"))
      .map((tag) => tag.id);

    const newTags = tags.filter(
      (tag) => tag.isNewTerm || tag.id.startsWith("new-")
    );

    // Create new tags if any exist
    let allTagIds = existingTags;
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

      allTagIds = [...existingTags, ...result.data.map((tag) => tag.id)];
    }

    // Handle media
    const remainingMediaIds = JSON.parse(
      formData.get("remaining-media") || "[]"
    );
    const files = formData.getAll("media-files");

    // Prepare media options
    const mediaOptions = {
      refId: serviceId,
      ref: "api::service.service",
      field: "media",
      namePrefix: "service",
    };

    // Handle media update with deduplication
    const finalMediaIds = await handleMediaUpdate({
      remainingMediaIds,
      files,
      options: mediaOptions,
    });

    // Prepare update payload
    const payload = {
      id: serviceId,
      data: {
        title,
        description,
        price,
        status: status === "Active" ? 1 : 2,
        addons,
        faq,
        media: finalMediaIds,
        // Add taxonomy relations
        category: categoryId ? categoryId : null,
        subcategory: subcategoryId ? subcategoryId : null,
        subdivision: subdivisionId ? subdivisionId : null,
        tags: allTagIds,
      },
    };

    const response = await postData(EDIT_SERVICE, payload);

    if (!response?.data?.updateService?.data) {
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
