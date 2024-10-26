"use server";

import { inspect } from "@/utils/inspect";
import { getClient } from ".";
import { isAuthenticated } from "../auth/authenticated";
import {
  STRAPI_GRAPHQL,
  STRAPI_TOKEN,
  STRAPI_URL,
  validateEnvVars,
} from "../strapi";
import { print } from "graphql/language/printer";
import { GET_ME } from "../graphql/queries/main/user";
import { cache } from "react";

/**
 * Checks server health by making an HTTP request to the server.
 *
 * @returns {Object} An object with a single property, `serverStatus`, which
 * is a boolean indicating whether the server is up or not.
 */
export const checkServerHealth = async () => {
  try {
    let serverStatus = null;
    // console.log("⚙️ Checking server health...");

    const response = await fetch(STRAPI_URL);

    // console.log("📡 Response status:", response.status);

    // Server is considered up if we get any response, even 404
    if (response.status >= 200 && response.status < 500) {
      // console.log("✅ Server is up.");
      serverStatus = true;
    } else {
      // console.log("❌ Server is down.");
      serverStatus = false;
    }

    return { serverStatus };
  } catch (error) {
    console.error("⚠️ Error checking server health:", error);
    return { serverStatus: false }; // Server is down if there's an error
  }
};

export const getData = cache(async (query, variables) => {
  validateEnvVars();

  const url = STRAPI_GRAPHQL;
  let queryString;

  if (typeof query === "string") {
    queryString = query;
  } else {
    try {
      queryString = print(query);
    } catch (error) {
      console.error("Error printing query:", error);
      throw new Error("Invalid GraphQL query");
    }
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
      body: JSON.stringify({
        query: queryString,
        variables,
      }),
      next: { revalidate: 60 },
    });

    // First check if the response is OK
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Check the content type to ensure we're getting JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      // Get the text response to help with debugging
      const text = await response.text();
      console.error("Received non-JSON response:", text.substring(0, 200)); // Log first 200 chars
      throw new Error(`Expected JSON response but got ${contentType}`);
    }

    // Now we can safely parse JSON
    const jsonResponse = await response.json();

    // Check for GraphQL errors
    if (jsonResponse.errors) {
      console.error("GraphQL errors:", jsonResponse.errors);
      throw new Error(JSON.stringify(jsonResponse.errors));
    }

    // If we have data, return it
    if (jsonResponse.data) {
      return jsonResponse.data;
    }

    // If we have no data but no errors, that's unexpected
    throw new Error("No data received from GraphQL endpoint");
  } catch (error) {
    // Log the full error for debugging
    console.error("getData error details:", {
      url,
      error: error.message,
      stack: error.stack,
    });

    // Return null instead of throwing to allow graceful fallback
    return null;
  }
});

// Generic GraphQL mutation function
export const postData = async (mutation, variables) => {
  validateEnvVars();
  const client = getClient();

  try {
    const { data } = await client.mutate({
      mutation,
      variables,
      context: {
        headers: {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
        },
      },
    });
    return data;
  } catch (error) {
    if (error.graphQLErrors) {
      console.log("GraphQL Errors:", error.graphQLErrors);
    }
    if (error.networkError) {
      console.log("Network Error:", error.networkError);
    }
    console.log("Failed to post GraphQL data!", error);
  }
};

// Generic GraphQL mutation function
export const putData = async (mutation, variables) => {
  validateEnvVars();
  const client = getClient();

  try {
    const { data } = await client.mutate({
      mutation,
      variables,
      context: {
        headers: {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
        },
      },
    });
    return data;
  } catch (error) {
    if (error.graphQLErrors) {
      console.log("GraphQL Errors:", error.graphQLErrors);
    }
    if (error.networkError) {
      console.log("Network Error:", error.networkError);
    }
    console.log("Failed to put GraphQL data!", error);
  }
};

// Generic GraphQL mutation function
export const getMe = async () => {
  validateEnvVars();

  const { authenticated, token } = await isAuthenticated();
  if (!authenticated) {
    console.error("User is not authenticated.");
    return;
  }

  const client = getClient();

  // TODO: CREATE ALL THE FIELDS FOR USER IN THE BACKEND
  const query = GET_ME;

  try {
    const { data } = await client.query({
      query,
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
    return data;
  } catch (error) {
    if (error.graphQLErrors) {
      console.log("GraphQL Errors:", error.graphQLErrors);
    }
    if (error.networkError) {
      console.log("Network Error:", error.networkError);
    }
    console.log("Failed to post GraphQL data!", error);
  }
};
