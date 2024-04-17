import { getData } from "../api";

export async function getService(serviceId) {
  const STRAPI_URL = process.env.STRAPI_API_URL;

  if (!STRAPI_URL) throw new Error("Missing STRAPI_URL environment variable.");

  const url = `services/${serviceId}?populate[freelancer][fields]=*&populate[category][fields][0]=title&populate[city][fields][0]=title&populate[skills][fields][0]=title&populate[packages][populate][0]=features&populate[addons][fields]=*&populate[faq][fields]=*`;

  const data = await getData(url);

  return data;
}
