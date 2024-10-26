import { getCookieData } from "@/utils/cookies";

export async function isAuthenticated() {
  const cookieData = await getCookieData();
  const jwtCookie = cookieData.find((cookie) => cookie.name === "jwt");
  const token = jwtCookie ? jwtCookie.value : undefined;
  const authenticated = token !== undefined;
  return { authenticated, token };
}
