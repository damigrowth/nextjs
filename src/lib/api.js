import { STRAPI_TOKEN, STRAPI_URL, validateEnvVars } from "./strapi";

export const getData = async (query) => {
  validateEnvVars();

  const url = `${STRAPI_URL}/${query}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },

      cache: "no-cache",
    });

    const data = await response.json();

    if (!response.ok && data.error) console.log(data.error.message);
    if (response.ok) {
      return data;
    }
  } catch (error) {
    console.error("Server error. Please try again later.", error);
    return { error: "Server error. Please try again later." };
  }
};

export const postData = async (url, arg) => {
  const STRAPI_URL = process.env.STRAPI_API_URL;
  const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

  if (!STRAPI_URL) throw new Error("Missing STRAPI_URL environment variable.");

  const api = `${STRAPI_URL}/${url}`;

  console.log("postData", arg);

  try {
    const response = await fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
      body: JSON.stringify({
        data: {
          ...arg,
        },
      }),
      cache: "no-cache",
    });

    // // Handle response
    // if (!response.ok) {
    //   const data = await response.json();
    //   return { message: data.error.message, errors: null };
    // }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Server error. Please try again later.", error);
    return { error: "Server error. Please try again later." };
  }
};
