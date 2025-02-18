// utils/graphql.js
import { print } from "graphql";

/**
 * Normalizes a GraphQL query to string format
 * @param {string|object} query - The GraphQL query (can be string or GraphQL AST)
 * @returns {string} The query as a string
 */
export const normalizeQuery = (query) => {
  return typeof query === "string" ? query : print(query);
};
