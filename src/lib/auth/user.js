"use server";

import { getData } from "../client/operations";
import { USER, USER_PARTIAL } from "../graphql/queries/main/user";
import { getToken } from "./token";

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
  try {
    // Use getData with the auth header
    const response = await getData(ME_QUERY, null);

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

export async function getAccess(roles) {
  const me = await getUserMe();

  const roleArray = Array.isArray(roles) ? roles : [roles];

  return roleArray.includes(me.data.role.type);
}

export async function getUserId() {
  const { ok, data } = await getUserMe();
  return ok ? Number(data.id) : null;
}

export async function getUser() {
  const uid = await getUserId();
  if (!uid) return null;

  const user = await getData(USER, { id: uid });
  return user?.usersPermissionsUser?.data?.attributes ?? null;
}

export async function getUserPartial() {
  const uid = await getUserId();
  if (!uid) return null;

  const userBasic = await getData(USER_PARTIAL, { id: uid });
  return userBasic?.usersPermissionsUser?.data?.attributes ?? null;
}
