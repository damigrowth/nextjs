"use server";

import { getClient } from ".";
import { STRAPI_TOKEN, validateEnvVars } from "../strapi";

// Generic GraphQL fetch function
export const getData = async (query, variables) => {
  validateEnvVars();
  const client = getClient();
  try {
    const { data } = await client.query({
      query,
      variables,
      context: {
        headers: {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
        },
      },
    });
    return data;
  } catch (error) {
    console.log("Failed to fetch GraphQL data!", error?.message);
  }
};

// Generic GraphQL mutation function
export const postData = async (mutation, variables) => {
  validateEnvVars();
  const client = getClient();

  console.log("MUTATION", mutation);
  console.log("VARIABLES", variables);

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
