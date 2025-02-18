"use server";

import { getToken } from "./auth/token";
import {
  STRAPI_API_URL,
  STRAPI_TOKEN,
  STRAPI_URL,
  validateEnvVars,
} from "./strapi";

//* REST API *//
// export const getPublicData = async (query) => {
//   const url = `${STRAPI_URL}/${query}`;

//   try {
//     const response = await fetch(url, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       cache: "no-cache",
//     });

//     const data = await response.json();

//     if (!response.ok && data.error) console.log(data.error.message);
//     if (response.ok) {
//       return data;
//     }
//   } catch (error) {
//     console.error("Server error. Please try again later.", error);
//     return { error: "Server error. Please try again later." };
//   }
// };

// export const getData = async (query) => {
//   validateEnvVars();

//   const url = `${STRAPI_URL}/${query}`;

//   try {
//     const response = await fetch(url, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${STRAPI_TOKEN}`,
//       },

//       cache: "no-cache",
//     });

//     const data = await response.json();

//     if (!response.ok && data.error) console.log(data.error.message);
//     if (response.ok) {
//       return data;
//     }
//   } catch (error) {
//     console.error("Server error. Please try again later.", error);
//     return { error: "Server error. Please try again later." };
//   }
// };

export async function postData(endpoint, data) {
  validateEnvVars();

  try {
    const response = await fetch(`${STRAPI_API_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
      body: JSON.stringify({
        data: {
          ...data,
        },
      }), // data is already in the correct format
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("RESPONSE", errorData);
      return errorData;
    }

    return await response.json();
  } catch (error) {
    console.error("Error posting data:", error);
    return { error: error.message };
  }
}

export const putData = async (url, payload, jwt) => {
  const endpoint = `${STRAPI_API_URL}/${url}`;
  const token = (await getToken()) || jwt;

  try {
    const response = await fetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Server error. Please try again later.", error);
    return { error: "Server error. Please try again later." };
  }
};

export const patchData = async (url, payload) => {
  validateEnvVars();

  const endpoint = `${STRAPI_URL}/${url}`;

  try {
    const response = await fetch(endpoint, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
      body: JSON.stringify({
        data: {
          ...payload,
        },
      }),
      cache: "no-cache",
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Server error. Please try again later.", error);
    return { error: "Server error. Please try again later." };
  }
};

export const postMedia = async (url, payload, jwt) => {
  const endpoint = `${STRAPI_API_URL}/${url}`;

  const token = (await getToken()) || jwt;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: payload,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Server error. Please try again later.", error);
    return { error: "Server error. Please try again later." };
  }
};
