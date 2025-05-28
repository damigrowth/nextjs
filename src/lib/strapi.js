export const STRAPI_URL = process.env.STRAPI_URL;

export const STRAPI_API_URL = process.env.STRAPI_API_URL;

export const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

export const STRAPI_GRAPHQL = process.env.STRAPI_GRAPHQL_URL;

// Strapi Url and Token
export const validateEnvVars = () => {
  // Check for required environment variables
  if (!STRAPI_GRAPHQL || !STRAPI_TOKEN) {
    throw new Error(
      'Missing STRAPI_URL or STRAPI_API_TOKEN environment variable.',
    );
  }
};
