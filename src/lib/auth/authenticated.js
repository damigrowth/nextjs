import { getCookieData } from "@/utils/cookies";

export async function isAuthenticated() {
  try {
    const cookieData = await getCookieData();
    const jwtCookie = cookieData.find((cookie) => cookie.name === "jwt");
    const token = jwtCookie ? jwtCookie.value : undefined;
    const authenticated = token !== undefined;
    return { authenticated, token };
  } catch (error) {
    console.error("Get Cookie error:", error);
    return { error: "Could not get cookie." };
  }
}
