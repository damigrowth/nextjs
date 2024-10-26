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
  try {
    // Validate environment variables
    if (!process.env.STRAPI_GRAPHQL_URL) {
      console.error("STRAPI_GRAPHQL is not defined");
      return null;
    }
    if (!process.env.STRAPI_API_TOKEN) {
      console.error("STRAPI_TOKEN is not defined");
      return null;
    }

    const url = process.env.STRAPI_GRAPHQL_URL;
    let queryString;

    if (typeof query === "string") {
      queryString = query;
    } else {
      try {
        queryString = print(query);
      } catch (error) {
        console.error("Error printing query:", error);
        return null;
      }
    }

    // Log request details (only in development)
    if (process.env.NODE_ENV === "development") {
      console.log("Making request to:", url);
      console.log("Auth token present:", !!process.env.STRAPI_API_TOKEN);
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
      },
      body: JSON.stringify({
        query: queryString,
        variables,
      }),
      next: { revalidate: 60 },
    });

    // Handle different response statuses
    if (response.status === 403) {
      console.error("Authentication failed. Please check your STRAPI_TOKEN.");
      return null;
    }

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      const text = await response.text();
      console.error("Error response:", text);
      return null;
    }

    const jsonResponse = await response.json();

    // Check for GraphQL errors
    if (jsonResponse.errors) {
      console.error("GraphQL errors:", jsonResponse.errors);
      return null;
    }

    return jsonResponse.data;
  } catch (error) {
    console.error("getData error details:", {
      url: STRAPI_GRAPHQL,
      error: error.message,
      stack: error.stack,
    });
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
