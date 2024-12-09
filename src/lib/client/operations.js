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

export async function fetchWithRetry(url, options, retries = 3, backoff = 300) {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeout);
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) =>
        setTimeout(resolve, backoff * Math.pow(2, i))
      );
    }
  }
}

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

// Optimized getData with better caching and retry logic
export const getData = cache(
  async (query, variables, useCache = true, authToken = STRAPI_TOKEN) => {
    validateEnvVars();

    const queryString = typeof query === "string" ? query : print(query);
    const cacheKey = JSON.stringify({ query: queryString, variables });

    try {
      const response = await fetchWithRetry(STRAPI_GRAPHQL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          ...(useCache && { "Cache-Control": "max-age=3600, s-maxage=3600" }),
        },
        body: JSON.stringify({
          query: queryString,
          variables,
        }),
        ...(useCache && {
          cache: "force-cache",
          tags: [
            "graphql",
            `query-${cacheKey}`,
            ...(variables?.cat ? [`category-${variables.cat}`] : []),
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("GraphQL error:", errorData.errors);
        return null;
      }

      const jsonResponse = await response.json();

      if (jsonResponse.errors) {
        console.error("GraphQL response errors:", jsonResponse.errors);
        return null;
      }

      return jsonResponse.data;
    } catch (error) {
      console.error("Server error:", error);
      throw error;
    }
  }
);

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
    return { data };
  } catch (error) {
    const fieldErrors = {};

    if (error.graphQLErrors?.[0]?.extensions?.errors) {
      Object.entries(error.graphQLErrors[0].extensions.errors).forEach(
        ([key, value]) => {
          fieldErrors[key] = value[0].message;
        }
      );
    }

    return {
      error: error.graphQLErrors?.[0]?.message || "An error occurred",
      errors: fieldErrors,
    };
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
