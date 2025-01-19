import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { STRAPI_GRAPHQL } from "../strapi";
import { registerApolloClient } from "@apollo/experimental-nextjs-app-support";

const cache = new InMemoryCache();

export const { getClient } = registerApolloClient(() => {
  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    cache,
    link: new HttpLink({
      uri: STRAPI_GRAPHQL,
    }),
    // headers: {
    //   Authorization: `Bearer ${STRAPI_TOKEN}`,
    // },
  });
});
