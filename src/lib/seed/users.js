"use server";

import { faker } from "@faker-js/faker";
import { cookies } from "next/headers";
import { STRAPI_TOKEN, STRAPI_URL, validateEnvVars } from "../strapi";
import { uploadMedia } from "../uploads/upload";

// Function to register a new user
export async function seedUsers(prevState, formData) {
  try {
    validateEnvVars();

    // API endpoints
    const registerUrl = `${STRAPI_URL}/auth/local/register`;
    const freelancerUrl = `${STRAPI_URL}/freelancers`;

    // Generate user data with Faker using the person module
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`;
    const email = faker.internet.email();
    const password = faker.internet.password();
    const displayName = `${firstName} ${lastName}`;

    const imageUrl = faker.image.avatar();
    const imageRes = await fetch(imageUrl);

    if (!imageRes.ok) {
      console.error("Error fetching avatar image");
      return { message: "Error fetching avatar image", errors: null };
    }

    const imageBlob = await imageRes.blob();

    const uploadedImageId = await uploadMedia([imageBlob]);

    const userData = {
      firstName,
      lastName,
      email,
      password,
      username,
      displayName,
      image: uploadedImageId,
    };

    // Make registration API call
    console.log("Registering user...");

    const userResponse = await fetch(registerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
      body: JSON.stringify(userData),
      cache: "no-cache",
    });

    if (!userResponse.ok) {
      const data = await userResponse.json();
      console.error("Error creating user", data?.error?.message);
      return { message: data?.error?.message, errors: null };
    }

    const user = await userResponse.json();
    const userId = user.user.id;
    console.log("User registered:", user);

    // Assign freelancer role
    const freelancerRoleId = 4;
    const userUrl = `${STRAPI_URL}/users/${userId}?populate=role`;

    // Update user role
    console.log("Assigning freelancer role...");
    await fetch(userUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
      body: JSON.stringify({
        role: freelancerRoleId,
      }),
      cache: "no-cache",
    });

    // Generate freelancer data
    const website = faker.internet.url();
    const tagline = faker.company.catchPhrase();
    const description = faker.lorem.paragraph(50);
    const commencement = faker.date
      .between({ from: new Date("2000-01-01"), to: new Date() })
      .getFullYear();
    const rate = faker.number.int({ min: 5, max: 100 });
    const topLevel = faker.datatype.boolean();

    const randomIds = (count, max) =>
      Array.from({ length: count }, () => faker.number.int({ min: 1, max }));

    const skills = randomIds(3, 5);
    const specialisations = randomIds(3, 5);
    const industries = randomIds(3, 5);
    const contactTypes = randomIds(3, 4);
    const payment_methods = randomIds(3, 5);
    const settlement_methods = randomIds(3, 3);
    const category = faker.number.int({ min: 3, max: 4 });
    const terms = faker.lorem.paragraph(25);

    // const userId = 1;

    // Data to be sent in the body
    const freelancerData = {
      username,
      user: userId,
      website,
      tagline,
      description,
      commencement,
      type: 1,
      size: 1,
      skills,
      specialisations,
      rate,
      topLevel,
      industries,
      contactTypes,
      payment_methods,
      settlement_methods,
      category,
      terms,
      base: {},
    };

    // Create freelancer
    console.log("Registering freelancer...");
    const freelancerResponse = await fetch(freelancerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
      body: JSON.stringify({ data: freelancerData }),
    });

    if (!freelancerResponse.ok) {
      const data = await freelancerResponse.json();
      console.error("Error registering freelancer", data?.error?.message);
      return { message: data?.error?.message, errors: null };
    }

    const freelancer = await freelancerResponse.json();
    console.log("Freelancer registered successfully", freelancer);

    return { message: "Freelancer registered successfully", errors: null };
  } catch (error) {
    console.error(error);
    return { error: "Server error. Please try again later." };
  }
}
