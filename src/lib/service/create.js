"use server";

import { postData } from "../api";
import { getFreelancerId } from "../freelancer/freelancer";
import { uploadMedia } from "../uploads/upload";

// Create service
export async function createService(prevState, formData) {
  try {
    // Strapi Url and Token
    const STRAPI_URL = process.env.STRAPI_API_URL;
    const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

    // Check for required environment variables
    if (!STRAPI_URL || !STRAPI_TOKEN) {
      throw new Error(
        "Missing STRAPI_API_URL or STRAPI_API_TOKEN environment variable."
      );
    }

    const parseField = (fieldName, type) => {
      let parsedField;
      const fieldValue = formData.get(fieldName);

      if (type === "JSON") {
        const parsedJSON = JSON.parse(fieldValue);
        parsedField = parsedJSON;
      }
      if (type === "Number") {
        const parsedNumber = parseFloat(fieldValue);
        parsedField = parsedNumber;
      }

      return parsedField;
    };

    const images = formData.get("uploaded-media");
    const service = parseField("service", "JSON");

    const media = service.gallery;

    console.log("media", media);

    // const freelancerId = await getFreelancerId();

    // const res = await postData("services", {
    //   ...service,
    //   freelancer: freelancerId,
    //   status: 2,
    // });

    // console.log("FORMDATA=>", res);
  } catch (error) {
    console.error(error);
    return { error: "Server error. Please try again later." };
  }
}
