import { getUser } from "../user/user";

export async function getFreelancerId() {
  const user = await getUser();
  const id = user.freelancer.id
  return id
}

export async function getFreelancer() {
  const STRAPI_URL = process.env.STRAPI_API_URL;

  if (!STRAPI_URL) throw new Error("Missing STRAPI_URL environment variable.");

  const freelancerId = await getFreelancerId()

  const url = `${STRAPI_URL}/freelancers/${freelancerId}?populate=*`;

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
    console.error("Server error. Please try again later:", error);
    return { error: "Server error. Please try again later." };
  }
}
