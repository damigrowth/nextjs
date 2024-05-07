"use server";

import { postData } from "../api";
import { getFreelancerId } from "../freelancer/freelancer";
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
      ...service,
      freelancer: freelancerId,
      status: 2,
      media: uploadedMedia,
    };

    const response = await postData("services", payload);

    // console.log("RESPONSE backend", response);

    if (!response.data) {
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
        data: response.data,
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
