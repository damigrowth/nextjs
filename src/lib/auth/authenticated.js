import { cookies } from "next/headers";

export async function isAuthenticated() {
  try {
    const token = cookies().get("jwt")?.value;
    const authenticated = token === undefined ? false : true;
    return { authenticated };
  } catch (error) {
    console.error("Get Cookie error:", error);
    return { error: "Could not get cookie." };
  }
}
