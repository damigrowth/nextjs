"use server";

import { inspect } from "@/utils/inspect";
import { getClient } from ".";
import {
  STRAPI_GRAPHQL,
  STRAPI_TOKEN,
  STRAPI_URL,
  validateEnvVars,
} from "../strapi";
import { print } from "graphql/language/printer";
import { cache } from "react";
import { getToken } from "../auth/token";
import { CACHE_CONFIG } from "../cache/config";
import { normalizeQuery } from "@/utils/queries";

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
  async (query, variables, cacheKey = "NO_CACHE", extraTags = []) => {
    validateEnvVars();
    const token = await getToken();

    const queryString = normalizeQuery(query);
    const cacheConfig = CACHE_CONFIG[cacheKey] || {};
    const { key, ttl } = cacheConfig;

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(key ? { "Cache-Control": `max-age=${ttl}, s-maxage=${ttl}` } : {}),
      },
      body: JSON.stringify({
        query: queryString,
        variables,
      }),
      ...(key && {
        next: {
          revalidate: ttl || 0,
          tags: ["graphql", key, ...extraTags].filter(Boolean),
        },
      }),
    };

    try {
      const response = await fetchWithRetry(STRAPI_GRAPHQL, options);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("GraphQL error:", inspect(errorData.errors));
        throw new Error(`Request failed with status ${response.status}`);
      }

      const jsonResponse = await response.json();

      // TODO: Need to fix all forbidden errors!
      // if (jsonResponse.errors) {
      //   console.log("GraphQL response errors:", jsonResponse);
      // }

      return jsonResponse.data;
    } catch (error) {
      console.error("Server error:", error);
      throw error;
    }
  }
);

// Generic GraphQL mutation function
export const postData = async (mutation, variables, jwt) => {
  const token = (await getToken()) || jwt;
  const client = getClient();

  try {
    const { data } = await client.mutate({
      mutation,
      variables,
      context: {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    });
    return { data };
  } catch (error) {
    console.error("GraphQL Error:", {
      message: error.message,
      graphQLErrors: error.graphQLErrors,
      networkError: error.networkError,
    });

    // Log the full error response
    if (error.networkError?.result) {
      console.log("GraphQL Response Errors:", error.networkError.result.errors);
    }

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

/**
 * Generic search function for Strapi collections with pagination
 * @param {Object|string} query - GraphQL query
 * @param {string} searchTerm - Search term
 * @param {number} page - Page number
 * @param {number} pageSize - Items per page
 * @param {Object} additionalVariables - Any additional variables needed for the query
 */
export const searchData = async ({
  query,
  searchTerm,
  page = 1,
  pageSize = 10,
  additionalVariables = {},
  searchTermType = "name",
}) => {
  try {
    const response = await getData(query, {
      [searchTermType]: searchTerm || "",
      ...additionalVariables,
    });

    // Get the collection name from the first key of the response
    const collectionKey = Object.keys(response)[0];
    const collection = response[collectionKey];

    return {
      data: collection?.data || [],
      meta: collection?.meta,
    };
  } catch (error) {
    console.error("Error searching collection:", error);
    return {
      data: [],
      meta: {
        pagination: {
          page,
          pageSize,
        },
      },
    };
  }
};
