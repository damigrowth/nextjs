'use server';

import { getData } from '@/lib/client/operations';
import { USER, USER_PARTIAL } from '@/lib/graphql';

import { getToken } from '../auth/token';
import { logout } from '../auth/logout';

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

  try {
    // CRITICAL SECURITY: Use explicit token isolation
    const user = await getData(USER, { id: uid }, 'NO_CACHE', [], token);
    const userData = user?.usersPermissionsUser?.data?.attributes;

    if (!userData) {
      console.error(
        'SECURITY_ALERT: No user data found for authenticated user ID:',
        uid,
        'with token type:',
        token ? 'provided' : 'from_cookies'
      );
      return null;
    }

    // CRITICAL SECURITY: Verify the returned user ID matches the expected ID
    if (userData.id && Number(userData.id) !== Number(uid)) {
      console.error('CRITICAL_SECURITY_ALERT: User ID mismatch in response!', {
        requestedUserId: uid,
        returnedUserId: userData.id,
        email: userData.email,
        timestamp: Date.now(),
      });

      // Log this critical security issue
      try {
        await fetch('/api/security/log-mismatch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'CRITICAL_USER_ID_MISMATCH',
            requestedUserId: uid,
            returnedUserId: userData.id,
            email: userData.email,
            timestamp: Date.now(),
          }),
        }).catch(() => {}); // Silent fail for logging
      } catch {}

      // Force logout and return null
      logout();
      return null;
    }

    // CRITICAL SECURITY: Verify user data integrity
    if (userData.freelancer?.data) {
      const freelancerData = userData.freelancer.data;
      const freelancerEmail = freelancerData.attributes?.email;
      const freelancerUserId = uid;
      const userEmail = userData.email;

      // Check for email mismatch
      if (freelancerEmail && userEmail && freelancerEmail !== userEmail) {
        console.error('SECURITY_ALERT: Email mismatch detected', {
          userId: uid,
          userEmail,
          freelancerId: freelancerData.id,
          freelancerEmail,
          timestamp: Date.now(),
        });

        // Log this critical security issue
        try {
          await fetch('/api/security/log-mismatch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'EMAIL_MISMATCH',
              userId: uid,
              userEmail,
              freelancerId: freelancerData.id,
              freelancerEmail,
              timestamp: Date.now(),
            }),
          }).catch(() => {}); // Silent fail for logging
        } catch {}

        // Return null to force re-authentication
        logout();
        return null;
      }

      // Check for user ID mismatch in freelancer relationship
      if (freelancerUserId && Number(freelancerUserId) !== Number(uid)) {
        console.error('SECURITY_ALERT: User-Freelancer relationship mismatch', {
          currentUserId: uid,
          freelancerUserId: freelancerUserId,
          freelancerId: freelancerData.id,
          email: userEmail,
          timestamp: Date.now(),
        });

        // Log this critical security issue
        try {
          await fetch('/api/security/log-mismatch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'USER_FREELANCER_MISMATCH',
              currentUserId: uid,
              freelancerUserId: freelancerUserId,
              freelancerId: freelancerData.id,
              email: userEmail,
              timestamp: Date.now(),
            }),
          }).catch(() => {}); // Silent fail for logging
        } catch {}

        // Return null to force re-authentication
        logout();
        return null;
      }

      // Check for username consistency
      const freelancerUsername = freelancerData.attributes?.username;
      const userUsername = userData.username;

      if (
        freelancerUsername &&
        userUsername &&
        freelancerUsername !== userUsername
      ) {
        console.warn('DATA_INCONSISTENCY: Username mismatch detected', {
          userId: uid,
          userUsername,
          freelancerId: freelancerData.id,
          freelancerUsername,
          timestamp: Date.now(),
        });

        // This is less critical but still worth logging
        try {
          await fetch('/api/security/log-mismatch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'USERNAME_INCONSISTENCY',
              userId: uid,
              userUsername,
              freelancerId: freelancerData.id,
              freelancerUsername,
              timestamp: Date.now(),
            }),
          }).catch(() => {}); // Silent fail for logging
        } catch {}

        // Don't block access for username mismatch, but log it
      }
    }

    return userData;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

export async function getUserPartial(token = null) {
  const uid = await getUserId(token);

  if (!uid) return null;

  // CRITICAL: Always use NO_CACHE for user data to prevent cross-user data leakage
  const userBasic = await getData(
    USER_PARTIAL,
    { id: uid },
    'NO_CACHE',
    [],
    token,
  );

  return userBasic?.usersPermissionsUser?.data?.attributes ?? null;
}
