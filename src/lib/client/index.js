import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { registerApolloClient } from "@apollo/experimental-nextjs-app-support";
import { STRAPI_GRAPHQL } from "../strapi";

export const { getClient } = registerApolloClient(() => {
  return new ApolloClient({
    cache: new InMemoryCache({
      typePolicies: {
        RatingEntity: {
          keyFields: ["id"], // Specify the primary identifier field
          merge(existing, incoming, { mergeObjects }) {
            // Use mergeObjects to deeply merge existing and incoming objects
            return mergeObjects(existing, incoming);
          },
        },
      },
    }),
    link: new HttpLink({
      uri: STRAPI_GRAPHQL,
    }),
  });
});
