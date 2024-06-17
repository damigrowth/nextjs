"use server";

import { postData } from "../client/operations";
import { getFreelancerId } from "../freelancer/freelancer";
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
    const uploadedMedia = await uploadMedia(files);

    // console.log("UPLOADED MEDIA", uploadedMedia);

    // GET FREELANCER ID
    const freelancerId = await getFreelancerId();

    // CREATE SERVICE
    const payload = {
      data: {
        fixed: service.fixed,
        title: service.title,
        description: service.description,
        price: service.price,
        time: service.time,
        category: service.category.id,
        tags: service.tags.map((el) => el.id),
        county: service.county.id,
        area: service.area.id,
        zipcode: service.zipcode.id,
        freelancer: Number(freelancerId),
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
