"use server";

import { getClient } from ".";
import { isAuthenticated } from "../auth/authenticated";
import { GET_ME } from "../graphql/queries";
import { STRAPI_GRAPHQL, STRAPI_TOKEN, validateEnvVars } from "../strapi";
import { print } from "graphql/language/printer";

// export const getData = async (query, variables) => {
//   validateEnvVars();
//   const client = getClient();

//   try {
//     const { data } = await client.query({
//       query,
//       variables,
//       context: {
//         headers: {
//           Authorization: `Bearer ${STRAPI_TOKEN}`,
//         },
//       },
//       context: {
//         fetchOptions: {
//           next: { revalidate: 1 },
//         },
//       },
//     });
//     return data;
//   } catch (error) {
//     if (error.graphQLErrors) {
//       console.log("GraphQL Errors:", error.graphQLErrors[0].extensions);
//     }
//     if (error.networkError) {
//       console.log("Network Error:", error.networkError);
//     }
//     console.log("Failed to get GraphQL data!", error);
//   }
// };

export const getData = async (query, variables) => {
  validateEnvVars();

  const url = `${STRAPI_GRAPHQL}`;

  const queryString = print(query);

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
      cache: "no-cache",
    });

    const { data } = await response.json();

    if (!response.ok && data.error) console.log(data.error.message);
    if (response.ok) {
      return data;
    }
  } catch (error) {
    console.error("Server error. Please try again later.", error);
    return { error: "Server error. Please try again later." };
  }
};

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
