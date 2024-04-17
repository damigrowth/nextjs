"use server";

import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";

export async function getUserId() {
  const token = cookies().get("jwt").value;

  const uid = jwtDecode(token).id;

  return uid
}

export async function getUser() {
  const STRAPI_URL = process.env.STRAPI_API_URL;

  if (!STRAPI_URL) throw new Error("Missing STRAPI_URL environment variable.");

  const uid = await getUserId() 

  const url = `${STRAPI_URL}/users/${uid}?populate=*`;

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
    console.error("Get User error:", error);
    return { error: "Server error. Please try again later." };
  }
}
