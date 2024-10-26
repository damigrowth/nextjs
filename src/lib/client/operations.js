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
    // If query is already a string, use it directly
    queryString = query;
  } else {
    // If query is an AST object, print it
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
      next: { revalidate: 60 }, // 1 minute
    });

    console.log("📡 Response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("GraphQL error:", errorData.errors);
      // throw new Error(JSON.stringify(errorData.errors));
    }

    const jsonResponse = await response.json();
    return jsonResponse.data;
  } catch (error) {
    console.error("Server error:", error);
    throw error;
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
