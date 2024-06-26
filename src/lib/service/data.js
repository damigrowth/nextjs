import { STRAPI_TOKEN, STRAPI_URL, validateEnvVars } from "../strapi";

export async function fetchServiceForm() {
  validateEnvVars();

  // API endpoints
  const categoriesUrl = `${STRAPI_URL}/categories?fields[0]=title`;
  const skillsUrl = `${STRAPI_URL}/skills?fields[0]=title`;
  const citiesUrl = `${STRAPI_URL}/cities?fields[0]=title`;
  const locationsUrl = `${STRAPI_URL}/locations?fields[0]=title`;

  try {
    // Fetch all data in parallel
    const [categoriesRes, skillsRes, citiesRes] = await Promise.all([
      fetch(categoriesUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${STRAPI_TOKEN}`,
        },
        cache: "no-cache",
      }),
      fetch(skillsUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${STRAPI_TOKEN}`,
        },
        cache: "no-cache",
      }),
      fetch(citiesUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${STRAPI_TOKEN}`,
        },
        cache: "no-cache",
      }),
    ]);

    // Handle Categories response
    if (!categoriesRes.ok) {
      const data = await categoriesRes.json();
      throw new Error(data.error.message);
    }

    // Handle Skills response
    if (!skillsRes.ok) {
      const data = await skillsRes.json();
      throw new Error(data.error.message);
    }

    // Handle Cities response
    if (!citiesRes.ok) {
      const data = await citiesRes.json();
      throw new Error(data.error.message);
    }

    // Parse responses
    const categoriesData = (await categoriesRes.json()).data;
    const skillsData = (await skillsRes.json()).data;
    const citiesData = (await citiesRes.json()).data;

    // Return the object containing categories, skills, and cities data
    return {
      categories: categoriesData,
      skills: skillsData,
      cities: citiesData,
    };
  } catch (error) {
    console.log(error);
    return { error: error.message };
  }
}
