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

    // const uploadedMediaUrls = await uploadMedia(media);

    console.log("media", images);
    // console.log("uploadedMediaUrls", uploadedMediaUrls);

    const freelancerId = await getFreelancerId();

    // service.data.freelancer = uid

    // const data = JSON.stringify(object);

    // console.log(freelancerId);

    // const title = formData.get('title')
    // const description =  formData.get('description')
    // const category = parseField('category', 'JSON');
    // const skills = parseField('skills', 'JSON');
    // const price = parseField('price', 'Number');
    // const time = parseField('time', 'Number');

    // // Validate form data against schema
    // const validatedFields = serviceFormSchema.safeParse({
    //   title,
    //   description,
    //   price,
    //   time,
    //   category,
    //   skills,
    // });

    //    // Check if form data validation failed
    //    if (!validatedFields.success) {
    //     return {
    //       errors: validatedFields.error.flatten().fieldErrors,
    //       message: "Missing Fields. Failed to Create Service.",
    //     };
    //   }

    // Destructure validated fields
    // const { title } = validatedFields.data;

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
