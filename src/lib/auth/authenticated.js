"use server";

import { cookies } from "next/headers";

export async function isAuthenticated() {
  try {
    const token = cookies().get("jwt")?.value;
    return token === undefined ? false : true;
  } catch (error) {
    console.error("Get Cookie error:", error);
    return { error: "Could not get cookie." };
  }
}
