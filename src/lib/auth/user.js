"use server";

import { getData } from "../client/operations";
import {
  ME,
  USER,
  USER_BY_ID,
  USER_PARTIAL,
} from "../graphql/queries/main/user";
import { STRAPI_GRAPHQL } from "../strapi";
import { getAuthToken } from "./token";

const ME_QUERY = `
  query {
    me {
      id
      role {
        id
        type
      }
    }
  }
`;

export async function getUserMe() {
  const authToken = await getAuthToken();
  if (!authToken) return { ok: false, data: null, error: null };

  try {
    // Use getData with the auth token
    const response = await getData(ME_QUERY, null, false, authToken);

    if (!response?.me) {
      return {
        ok: false,
        data: null,
        error: "User not found",
      };
    }

    return {
      ok: true,
      data: response.me,
      error: null,
    };
  } catch (error) {
    console.error("GraphQL getUserMe error:", error);
    return {
      ok: false,
      data: null,
      error: error.message || "Failed to fetch user data",
    };
  }
}

export async function getUserId() {
  const { ok, data } = await getUserMe();
  return ok ? Number(data.id) : null;
}

export async function getUser() {
  const uid = await getUserId();

  let data = null;

  const user = await getData(USER, { id: uid });

  data = user?.usersPermissionsUser?.data?.attributes;

  return data;
}

export async function getUserPartial() {
  const uid = await getUserId();

  let data = null;

  const userBasic = await getData(USER_PARTIAL, { id: uid });

  data = userBasic?.usersPermissionsUser?.data?.attributes;

  return data;
}
