'use server';

// import { inspect } from "@/utils/inspect";
// import { print } from 'graphql/language/printer';
import { cache } from 'react';

import { normalizeQuery } from '@/utils/queries';

import { CACHE_CONFIG } from '../cache/config';
import {
  STRAPI_GRAPHQL,
  STRAPI_TOKEN,
  STRAPI_URL,
  validateEnvVars,
} from '../strapi';
import { getClient } from '.';
import { getToken } from '@/actions/auth/token';
import { strapiErrorTranslations } from '@/utils/errors';

export async function fetchWithRetry(url, options, retries = 3, backoff = 300) {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();

      const timeout = setTimeout(() => controller.abort(), 10000); // Increased timeout to 10 seconds

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) =>
        setTimeout(resolve, backoff * Math.pow(2, i)),
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
    console.error('⚠️ Error checking server health:', error);

    return { serverStatus: false }; // Server is down if there's an error
  }
};

// Internal implementation of getData that is not cached
const getDataInternal = async (
  query,
  variables,
  cacheKey = 'NO_CACHE',
  extraTags = [],
  userToken = null, // Accept token as parameter for cache isolation
) => {
  validateEnvVars();

  // Use provided token or get from cookies
  const token = userToken !== null ? userToken : await getToken();

  const queryString = normalizeQuery(query);

  const cacheConfig = CACHE_CONFIG[cacheKey] || {};

  const { key, ttl } = cacheConfig;

  // If cacheKey is NO_CACHE, we'll set explicit no-cache headers
  const isNoCache = cacheKey === 'NO_CACHE';

  // Filter out null or undefined variables before sending
  const filteredVariables = {};

  if (variables) {
    for (const [varKey, varValue] of Object.entries(variables)) {
      if (varValue !== null && varValue !== undefined) {
        filteredVariables[varKey] = varValue;
      }
    }
  }

  // SECURITY LOG: Log user-specific queries for monitoring
  if (userToken) {
    // console.log('🔒 USER_QUERY: Executing with authentication token');
  }

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(isNoCache
        ? { 'Cache-Control': 'no-store, max-age=0, must-revalidate' }
        : key
          ? { 'Cache-Control': `max-age=${ttl}, s-maxage=${ttl}` }
          : {}),
    },
    body: JSON.stringify({
      query: queryString,
      variables: filteredVariables, // Use filtered variables
    }),
    ...(isNoCache
      ? { cache: 'no-store', next: { revalidate: 0 } }
      : key && {
          next: {
            revalidate: ttl || 0,
            tags: ['graphql', key, ...extraTags].filter(Boolean),
          },
        }),
  };

  try {
    const response = await fetchWithRetry(STRAPI_GRAPHQL, options);

    // Check for redirect status codes (3xx)
    if (
      response.redirected ||
      (response.status >= 300 && response.status < 400)
    ) {
      console.warn(
        `Redirect detected for GraphQL query. Status: ${response.status}, URL: ${response.url}`,
      );

      return null; // Return null to indicate a non-successful fetch due to redirect
    }

    if (!response.ok) {
      const clonedResponse = response.clone();

      const errorData = await clonedResponse.json();
      // console.log("GraphQL error:", errorData?.errors);
      // console.log("GraphQL response status:", response?.status);
    }

    const jsonResponse = await response.json();

    // console.log(
    //   "%cMyProject%cline:133%cjsonResponse",
    //   "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
    //   "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
    //   "color:#fff;background:rgb(217, 104, 49);padding:3px;border-radius:2px",
    //   jsonResponse
    // );
    return jsonResponse.data;
  } catch (error) {
    console.error('Server error in getDataInternal:', error); // Added more specific error origin
    throw error;
  }
};

// SIMPLIFIED: Cache only for public data (no user tokens)
const getDataCached = cache(async (query, variables, cacheKey, extraTags) => {
  return getDataInternal(query, variables, cacheKey, extraTags, null); // null = no user token
});

// SIMPLIFIED: Always use NO_CACHE for any user-related data
export const getData = async (
  query,
  variables,
  cacheKey = 'NO_CACHE',
  extraTags = [],
  providedToken = null,
) => {
  // CRITICAL FIX: Only get token if NO token was provided
  // Never mix provided tokens with cookie tokens
  let userToken = null;
  if (providedToken !== null) {
    userToken = providedToken;
  } else {
    userToken = await getToken();
  }

  // CRITICAL SECURITY: NEVER cache user-specific data
  const isUserSpecificQuery =
    userToken || // If there's any token, it's user-specific
    query.toString().includes('me') ||
    query.toString().includes('getUser') ||
    query.toString().includes('usersPermissionsUser') ||
    query.toString().includes('freelancer') ||
    query.toString().includes('Freelancer') ||
    variables?.id; // User ID queries

  // FORCE NO_CACHE for ALL user-specific queries
  if (isUserSpecificQuery) {
    // console.log('🔒 SECURITY: Using NO_CACHE for user-specific query');
    return getDataInternal(query, variables, 'NO_CACHE', extraTags, userToken);
  }

  // Only cache public/non-user data
  if (cacheKey === 'NO_CACHE') {
    return getDataInternal(query, variables, 'NO_CACHE', extraTags, userToken);
  }

  // For truly public data only (no token), use caching
  return getDataCached(query, variables, cacheKey, extraTags);
};

// Version of getData specifically for public data (e.g., sitemaps) that avoids token/cookie usage
export const getPublicData = cache(
  async (query, variables, cacheKey = 'NO_CACHE', extraTags = []) => {
    validateEnvVars();

    // No getToken() call here
    const queryString = normalizeQuery(query);

    const cacheConfig = CACHE_CONFIG[cacheKey] || {};

    const { key, ttl } = cacheConfig;

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // No Authorization header
        ...(key ? { 'Cache-Control': `max-age=${ttl}, s-maxage=${ttl}` } : {}),
      },
      body: JSON.stringify({
        query: queryString,
        variables,
      }),
      ...(key && {
        next: {
          revalidate: ttl || 0,
          tags: ['graphql', key, ...extraTags].filter(Boolean),
        },
      }),
    };

    try {
      const response = await fetch(STRAPI_GRAPHQL, options);

      if (!response.ok) {
        const clonedResponse = response.clone();

        const errorData = await clonedResponse.json();

        console.error('Public GraphQL error:', errorData?.errors);
        console.error('Public GraphQL response status:', response?.status);

        // Consider throwing a more specific error or returning null/empty data
        return null; // Or handle error appropriately for sitemaps
      }

      const jsonResponse = await response.json();

      // Basic error check for GraphQL-level errors
      if (jsonResponse.errors) {
        console.error('Public GraphQL response errors:', jsonResponse.errors);

        return null; // Or handle error appropriately
      }

      return jsonResponse.data;
    } catch (error) {
      console.error('Public data fetch server error:', error);

      // Consider throwing a more specific error or returning null/empty data
      return null; // Or handle error appropriately
    }
  },
);

export const postData = async (mutation, variables, jwt) => {
  const token =
    jwt || (mutation.toString().includes('login') ? null : await getToken());
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
    // Handle network errors (timeouts, connection issues)
    if (error.networkError) {
      let networkMessage = 'Πρόβλημα σύνδεσης - παρακαλώ προσπαθήστε ξανά';

      if (error.networkError.statusCode === 401) {
        networkMessage = 'Αποτυχία ταυτοποίησης - παρακαλώ συνδεθείτε ξανά';
      } else if (error.networkError.statusCode === 500) {
        networkMessage =
          'Σφάλμα διακομιστή - παρακαλώ προσπαθήστε ξανά αργότερα';
      }

      return {
        error: networkMessage,
        errors: {},
      };
    }

    // Your original GraphQL error handling (keep as-is)
    const fieldErrors = {};
    if (error.graphQLErrors?.[0]?.extensions?.errors) {
      Object.entries(error.graphQLErrors[0].extensions.errors).forEach(
        ([key, value]) => {
          fieldErrors[key] = value[0].message;
        },
      );
    }

    const mainErrorMessage =
      error.graphQLErrors?.[0]?.message || 'An error occurred';

    // Safe access to translations (in case strapiErrorTranslations is undefined)
    const translatedMainErrorMessage =
      (strapiErrorTranslations && strapiErrorTranslations[mainErrorMessage]) ||
      mainErrorMessage;

    const translatedFieldErrors = {};
    if (error.graphQLErrors?.[0]?.extensions?.errors) {
      Object.entries(error.graphQLErrors[0].extensions.errors).forEach(
        ([key, value]) => {
          const fieldErrorMessage = value[0].message;
          translatedFieldErrors[key] = [
            (typeof strapiErrorTranslations === 'object' &&
              strapiErrorTranslations[fieldErrorMessage]) ||
              fieldErrorMessage,
          ];
        },
      );
    }

    return {
      error: translatedMainErrorMessage,
      errors: translatedFieldErrors,
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
    // if (error.graphQLErrors) {
    //   console.log("GraphQL Errors:", error.graphQLErrors);
    // }
    // if (error.networkError) {
    //   console.log("Network Error:", error.networkError);
    // }
    // console.log("Failed to put GraphQL data!", error);
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
  searchTermType = 'name',
}) => {
  try {
    const response = await getData(query, {
      [searchTermType]: searchTerm || '',
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
    console.error('Error searching collection:', error);

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
