"use server";

import { postData } from "../client/operations";
import { getFreelancerId } from "../users/freelancer";
import { POST_SERVICE } from "../graphql/mutations";
import { uploadMedia } from "../uploads/upload";

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
    const { freelancerId } = await getFreelancerId();

    // CREATE SERVICE
    const payload = {
      data: {
        type: service.type,
        fixed: service.fixed,
        title: service.title,
        description: service.description,
        price: service.price,
        subscription_type:
          service.type.subscription === true ? service.subscription_type : null,
        time: service.time,
        category: service.category.id,
        subcategory: service.subcategory.id,
        subdivision: service.subdivision.id,
        // tags: service.tags.map((el) => el.id),
        freelancer: freelancerId,
        status: 2,
        media: uploadedMedia,
      },
    };

    // console.log("PAYLOAD", payload);

    // const response = await postData("services", payload);
    const response = await postData(POST_SERVICE, payload);

    if (!response?.createService?.data) {
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
        data: response.createService.data,
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
