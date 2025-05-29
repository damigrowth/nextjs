'use server';

import { getData } from '@/lib/client/operations';
import { USER, USER_PARTIAL } from '@/lib/graphql';

import { getToken } from '../auth/token';

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

export async function getUserMe(providedToken = null) {
  try {
    // Use provided token or get token from cookies
    const token = providedToken || (await getToken());

    if (!token) {
      return {
        ok: false,
        data: null,
        error: 'No authentication token',
      };
    }

    // Use getData with the auth header
    const response = await getData(ME_QUERY, null, token);

    if (!response?.me) {
      return {
        ok: false,
        data: null,
        error: 'User not found',
      };
    }

    return {
      ok: true,
      data: response.me,
      error: null,
    };
  } catch (error) {
    console.error('GraphQL getUserMe error:', error);

    return {
      ok: false,
      data: null,
      error: error.message || 'Failed to fetch user data',
    };
  }
}

export async function getAccess(roles, token = null) {
  const me = await getUserMe(token);

  // If getUserMe failed, user has no access
  if (!me.ok || !me.data?.role?.type) {
    return false;
  }

  const roleArray = Array.isArray(roles) ? roles : [roles];

  return roleArray.includes(me.data.role.type);
}

export async function getUserId(token = null) {
  const { ok, data } = await getUserMe(token);

  return ok ? Number(data.id) : null;
}

export async function getUser(token = null) {
  const uid = await getUserId(token);

  if (!uid) return null;

  const user = await getData(USER, { id: uid }, token);

  return user?.usersPermissionsUser?.data?.attributes ?? null;
}

export async function getUserPartial(token = null) {
  const uid = await getUserId(token);

  if (!uid) return null;

  const userBasic = await getData(USER_PARTIAL, { id: uid }, token);

  return userBasic?.usersPermissionsUser?.data?.attributes ?? null;
}
