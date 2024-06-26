import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { registerApolloClient } from "@apollo/experimental-nextjs-app-support";
import { STRAPI_GRAPHQL, STRAPI_TOKEN } from "../strapi";

const customMergeFunction = {
  UsersPermissionsUserEntity: {
    merge(existing, incoming, { mergeObjects }) {
      return mergeObjects(existing, incoming);
    },
  },
  // Define custom merge functions for other types if necessary
};

const cache = new InMemoryCache();

// const cache = new InMemoryCache({
//   typePolicies: {
//     UsersPermissionsUserEntity: {
//       keyFields: ["id"], // Ensure Apollo knows the unique identifier
//       fields: {
//         attributes: customMergeFunction.UsersPermissionsUserEntity,
//       },
//     },
//   },
// });

export const { getClient } = registerApolloClient(() => {
  return new ApolloClient({
    // uri: STRAPI_GRAPHQL,
    // defaultOptions: {
    //   query: {
    //     fetchPolicy: "no-cache",
    //     errorPolicy: "all",
    //   },
    // },
    ssrMode: typeof window === "undefined",
    cache,
    link: new HttpLink({
      uri: STRAPI_GRAPHQL,
    }),
    headers: {
      Authorization: `Bearer ${STRAPI_TOKEN}`,
    },
  });
});

// export const { getClient } = registerApolloClient(() => {
//   return new ApolloClient({
//     cache: new InMemoryCache({
//       typePolicies: {
//         RatingEntity: {
//           keyFields: ["id"], // Specify the primary identifier field
//           merge(existing, incoming, { mergeObjects }) {
//             // Use mergeObjects to deeply merge existing and incoming objects
//             return mergeObjects(existing, incoming);
//           },
//         },
//       },
//     }),
//     link: new HttpLink({
//       uri: STRAPI_GRAPHQL,
//     }),
//   });
// });
