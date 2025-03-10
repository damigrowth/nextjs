"use server";

import { postData } from "../client/operations";
import { getFreelancerId } from "../users/freelancer";
import { POST_SERVICE } from "../graphql/mutations";
import { uploadMedia } from "../uploads/upload";
import { createTags } from "../tags";

// Create service
export async function createService(prevState, formData) {
  try {
    const parseField = (fieldName, type) => {
      let parsedField;
      const fieldValue = formData.get(fieldName);

      if (fieldValue !== null) {
        if (type === "JSON") {
          parsedField = JSON.parse(fieldValue);
        } else if (type === "Number") {
          parsedField = parseFloat(fieldValue);
        }
      }

      return parsedField;
    };

    // PARSE SERVICE FIELDS
    const service = parseField("service", "JSON");

    // Separate existing and new tags
    const existingTags = service.tags
      .filter((tag) => tag.id !== "new")
      .map((tag) => tag.id);
    const newTags = service.tags.filter((tag) => tag.id === "new");

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

    // UPLOAD MEDIA
    // GET MEDIA IDS
    const files = formData.getAll("media-files");
    const firstFileSize = files[0].size;
    let uploadedMedia = [];

    if (firstFileSize > 0) {
      uploadedMedia = await uploadMedia(files);
    }

    // console.log("FILES", files);
    // console.log("SIZE", firstFileSize);
    // console.log("UPLOADED MEDIA", uploadedMedia);

    // GET FREELANCER ID
    const fid = await getFreelancerId();

    // CREATE SERVICE
    const payload = {
      data: {
        freelancer: fid,
        type: service.type,
        fixed: service.fixed,
        title: service.title,
        description: service.description,
        price: service.price,
        subscription_type: service.subscription_type,
        time: service.time,
        category: service.category.id,
        subcategory: service.subcategory.id,
        subdivision: service.subdivision.id,
        tags: allTagIds,
        status: 2,
        addons: service.addons,
        faq: service.faq,
        media: uploadedMedia,
      },
    };

    const response = await postData(POST_SERVICE, payload);

    if (!response?.data?.createService?.data) {
      return {
        ...prevState,
        message: "Η δημιουργία υπηρεσίας απέτυχε!",
        errors: response,
        data: null,
      };
    } else {
      return {
        ...prevState,
        message: "Η δημιουργία υπηρεσίας ολοκληρώθηκε επιτυχώς!",
        errors: null,
        data: response.data.createService.data,
      };
    }
  } catch (error) {
    console.error(error);
    return {
      errors: error?.message,
      message: "Server error. Please try again later.",
      data: null,
    };
  }
}
