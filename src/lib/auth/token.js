import { getCookieData } from "@/utils/cookies";

export async function getAuthToken() {
  const cookieData = await getCookieData();
  const jwtCookie = cookieData.find((cookie) => cookie.name === "jwt");
  const authToken = jwtCookie ? jwtCookie.value : undefined;
  return authToken;
}
