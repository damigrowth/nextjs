"use server";

import { STRAPI_TOKEN, STRAPI_URL, validateEnvVars } from "./strapi";

//* REST API *//
export const getPublicData = async (query) => {
  const url = `${STRAPI_URL}/${query}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
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

export const postData = async (url, payload) => {
  validateEnvVars();

  const endpoint = `${STRAPI_URL}/${url}`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
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

export const putData = async (url, payload) => {
  validateEnvVars();

  const endpoint = `${STRAPI_URL}/${url}`;

  try {
    const response = await fetch(endpoint, {
      method: "PUT",
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

export const postMedia = async (url, payload) => {
  validateEnvVars();

  const endpoint = `${STRAPI_URL}/${url}`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
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
