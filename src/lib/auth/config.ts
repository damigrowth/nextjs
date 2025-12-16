import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { admin, apiKey, jwt } from 'better-auth/plugins';
import { User } from '@prisma/client';
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } from '@/lib/email';
import { brevoListManager } from '@/lib/email/providers/brevo/list-management';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma/client';
import { cookies } from 'next/headers';

export const auth = betterAuth({
  // Production uses doulitsa.gr, development uses localhost, previews use VERCEL_URL
  baseURL:
    process.env.VERCEL_ENV === 'production'
      ? 'https://doulitsa.gr'
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000',
  trustedOrigins: [
    'http://localhost:3000', // Local development
    'https://doulitsa.gr', // Production domain
    'https://www.doulitsa.gr', // Production www domain
    ...(process.env.VERCEL_URL && process.env.VERCEL_ENV !== 'production'
      ? [`https://${process.env.VERCEL_URL}`]
      : []), // Preview deployments only
  ],
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 2 * 60, // Cache session data for 2 minutes in signed cookies for faster updates
    },
    freshAge: 60 * 60 * 24, // 1 day - sessions are considered "fresh" for 24 hours (needed for deleteUser)
  },
  advanced: {
    // Fix state_mismatch errors in production by configuring cookies properly
    useSecureCookies: process.env.NODE_ENV === 'production',
    cookiePrefix: 'better-auth',
    defaultCookieAttributes: {
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true, // Prevent client-side JavaScript access
      path: '/', // Ensure cookies are available for all paths
    },
    crossSubDomainCookies:
      process.env.VERCEL_ENV === 'production'
        ? {
            enabled: true,
            domain: 'doulitsa.gr', // Explicitly set cookie domain for production
          }
        : undefined,
    // Add OAuth state validation timeout (5 minutes)
    oauthStateTimeout: 5 * 60 * 1000, // 5 minutes in milliseconds
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    // Custom password verification to handle Strapi bcrypt hashes
    password: {
      hash: async (password: string) => {
        // Use bcrypt for new passwords with higher rounds for security
        return await bcrypt.hash(password, 12);
      },
      verify: async (data: { password: string; hash: string }) => {
        try {
          // Support both new hashes (12 rounds) and migrated Strapi hashes (10 rounds)
          return await bcrypt.compare(data.password, data.hash);
        } catch (error) {
          console.error('Password verification error:', error);
          return false;
        }
      },
    },
    sendResetPassword: async ({ user, url, token }, request) => {
      try {
        if (!user.email) {
          console.error(
            'Cannot send password reset email: user email is missing',
          );
          return;
        }
        // Fetch full user data if needed
        const userWithFields = await prisma.user.findUnique({
          where: { id: user.id },
          select: { displayName: true, username: true }
        });
        await sendPasswordResetEmail(user.email, userWithFields?.displayName, userWithFields?.username, url);
      } catch (error) {
        console.error('Failed to send password reset email:', error);
        // Don't throw error here to prevent reset from failing
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      try {
        if (!user.email) {
          console.error(
            'Cannot send verification email: user email is missing',
          );
          return;
        }
        // Fetch full user data if needed
        const userWithFields = await prisma.user.findUnique({
          where: { id: user.id },
          select: { displayName: true, username: true }
        });
        await sendVerificationEmail(user.email, userWithFields?.displayName, userWithFields?.username, url);
      } catch (error) {
        console.error('Failed to send verification email:', error);
        // Don't throw error here to prevent registration from failing
      }
    },
    autoSignInAfterVerification: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      enabled: !!(
        process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ),
      redirectURI:
        process.env.VERCEL_ENV === 'production'
          ? 'https://doulitsa.gr/api/auth/callback/google'
          : undefined,
      mapProfileToUser: (profile) => {
        // console.log('Google profile:', profile);
        // Available Google profile properties:
        // profile.sub - unique Google user ID
        // profile.name - full name (e.g. "John Doe")
        // profile.given_name - first name
        // profile.family_name - last name
        // profile.picture - profile picture URL
        // profile.email - email address
        // profile.email_verified - boolean for email verification
        // profile.locale - user's locale (e.g. "en", "el")
        // profile.hd - hosted domain (for Google Workspace users)

        return {
          firstName: profile.given_name,
          lastName: profile.family_name,
          name: profile.name, // Full name as fallback
          image: profile.picture,
          emailVerified: true, // OAuth providers have verified emails
          provider: 'google', // Set provider for Google OAuth users
          // Don't set username here - it will be set during OAuth setup to avoid duplicates
          // displayName can be prefilled for better UX
          displayName:
            profile.name ||
            `${profile.given_name || ''} ${profile.family_name || ''}`.trim() ||
            null,
          // Type and role will be set in OAuth setup page based on user selection
          // Note: profile.email is automatically mapped by Better Auth
        };
      },
    },
  },
  user: {
    additionalFields: {
      type: { type: 'string', defaultValue: 'user' }, // 'user', 'pro' - for registration flow
      role: { type: 'string', defaultValue: 'user', input: false }, // user, freelancer, company, admin - MUST NOT be user-settable
      step: { type: 'string', defaultValue: 'EMAIL_VERIFICATION' }, // EMAIL_VERIFICATION, OAUTH_SETUP, ONBOARDING, DASHBOARD
      provider: { type: 'string', defaultValue: 'email' }, // 'email', 'google', 'github', etc.
      username: { type: 'string', required: false }, // Keep in user for auth
      displayName: { type: 'string', required: false }, // Keep in user for auth
      firstName: { type: 'string', required: false }, // Keep in user for menu/auth
      lastName: { type: 'string', required: false }, // Keep in user for menu/auth
      image: { type: 'string', required: false }, // Profile image JSON string synced from profile
      confirmed: { type: 'boolean', defaultValue: false },
      blocked: { type: 'boolean', defaultValue: false },
    },
    deleteUser: {
      enabled: true,
      beforeDelete: async (user) => {
        // Clean up Brevo email lists (GDPR compliance)
        try {
          if (user.email) {
            const result = await brevoListManager.deleteContact(user.email);
            if (result.success) {
              console.log(`Brevo contact deleted for ${user.email}`);
            } else {
              console.error(`Failed to delete Brevo contact for ${user.email}:`, result.message);
            }
          }
        } catch (error) {
          // Log error but don't block deletion - this is a non-critical cleanup operation
          console.error('Brevo cleanup error during account deletion:', error);
        }

        // Delete Better Auth verification tokens (no relation to User, must delete manually)
        try {
          const deleted = await prisma.verification.deleteMany({
            where: { identifier: user.email },
          });
          console.log(`Deleted ${deleted.count} verification token(s) for ${user.email}`);
        } catch (error) {
          // Log error but don't block deletion - verification cleanup is non-critical
          console.error('Verification token cleanup error during account deletion:', error);
        }
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, context) => {
          // console.log('CREATING USER:', user);
          // console.log('CREATING USER CONTEXT:', context);
          // console.log('CREATING USER CONTEXT BODY:', context.body);

          /**
           * User type/role structure:
           * - Regular users: type='user', role='user'
           * - Pro users: type='pro', role='freelancer'|'company'
           *
           * For email/password users: Read from context.body (type and proRole)
           * For OAuth users: Read from oauth_intent cookie (set before OAuth flow)
           */

          // For OAuth users, provider comes from the user data (mapProfileToUser)
          // For email/password users, provider comes from request body
          const requestProvider =
            (user as any).provider || context.body?.provider || 'email';

          let requestType: string;
          let requestRole: string;

          // OAuth users: read intent from cookie
          if (requestProvider === 'google') {
            try {
              const cookieStore = await cookies();
              const intentCookie = cookieStore.get('oauth_intent');

              if (intentCookie?.value) {
                const intent = JSON.parse(intentCookie.value);
                requestType = intent.type || 'user';

                if (requestType === 'pro' && intent.role) {
                  requestRole = intent.role;
                } else {
                  requestRole = 'user';
                }
              } else {
                // No intent cookie = New user from /login OAuth flow without type selection
                // Set temporary default type='user' - will be updated after type selection
                // The TYPE_SELECTION step will control the flow, not the type field
                requestType = 'user';
                requestRole = 'user'; // Temporary, will be set after type selection
              }
            } catch (error) {
              // Fallback on error
              requestType = 'user';
              requestRole = 'user';
            }
          } else {
            // Email/password users: read from context.body
            requestType = context.body?.type || 'user';
            const proRole = context.body?.proRole;

            if (requestType === 'user') {
              requestRole = 'user';
            } else if (requestType === 'pro') {
              if (!proRole || !['freelancer', 'company'].includes(proRole)) {
                console.error(
                  'Invalid or missing proRole for pro user:',
                  proRole,
                );
                throw new Error(
                  'Pro users must have a valid proRole (freelancer or company)',
                );
              }
              requestRole = proRole;
            } else {
              console.error('Invalid user type:', requestType);
              throw new Error('Invalid user type. Must be "user" or "pro"');
            }
          }

          // console.log('Setting user - Provider:', requestProvider, 'Type:', requestType, 'Role:', requestRole);

          // Store role and intent status in context to set after creation (admin plugin blocks role in create)
          (context as any)._pendingRole = requestRole;
          // For OAuth users, track if they came with intent cookie (from /register) or without (from /login)
          if (requestProvider === 'google') {
            try {
              const cookieStore = await cookies();
              const intentCookie = cookieStore.get('oauth_intent');
              (context as any)._hasOAuthIntent = !!intentCookie?.value;
            } catch {
              (context as any)._hasOAuthIntent = false;
            }
          }

          return {
            data: {
              ...user,
              type: requestType,
              provider: requestProvider,
            },
          };
        },
        after: async (user, context) => {
          // console.log('CREATED USER', user);
          // console.log('CREATED USER CONTEXT', context.body);

          // Cast to any to access additional fields that Better Auth might not have in its types
          const userWithFields = user as any;
          const provider = userWithFields.provider || 'email';

          // Get pending role from context (set in before hook)
          const pendingRole = (context as any)._pendingRole || 'user';

          if (provider === 'google') {
            // Check if user has OAuth intent (came from /register with type selection)
            // If no intent, they came from /login and need type selection
            const hasOAuthIntent = (context as any)._hasOAuthIntent || false;

            // OAuth Flow:
            // - With intent (from /register): Google Auth → OAuth Setup → Dashboard/Onboarding
            // - Without intent (from /login): Google Auth → Type Selection → OAuth Setup → Dashboard/Onboarding
            await prisma.user.update({
              where: { id: user.id },
              data: {
                role: pendingRole, // Set role here (admin plugin allows after creation)
                step: hasOAuthIntent ? 'OAUTH_SETUP' : 'TYPE_SELECTION',
                confirmed: true, // OAuth users are pre-confirmed
                emailVerified: true, // OAuth providers have verified emails
              },
            });
          } else {
            // Email Flow: Register → Email Verification → Dashboard (user) or Onboarding (pro)
            await prisma.user.update({
              where: { id: user.id },
              data: {
                role: pendingRole, // Set role here (admin plugin allows after creation)
                step: 'EMAIL_VERIFICATION',
                confirmed: true, // Email/password users start as confirmed
              },
            });
          }
        },
      },
      update: {
        after: async (user, context) => {
          // console.log('UPDATING USER', user);
          // console.log('UPDATING USER CONTEXT', context.body);

          // Cast to any to access additional fields that Better Auth might not have in its types
          const userWithFields = user as any;

          // Handle role updates for pro users during onboarding
          if (
            userWithFields.step === 'ONBOARDING' &&
            userWithFields.type === 'pro' &&
            context.body?.role &&
            context.body.role !== userWithFields.role
          ) {
            // Update role for pro users (both email and OAuth)
            await prisma.user.update({
              where: { id: userWithFields.id },
              data: {
                role: context.body.role,
              },
            });
          }

          // Handle email verification completion for email/password users only
          if (
            userWithFields.emailVerified &&
            userWithFields.step === 'EMAIL_VERIFICATION' &&
            userWithFields.provider === 'email'
          ) {
            // console.log('Email verification completed for email user:', {
            //   id: userWithFields.id,
            //   email: userWithFields.email,
            //   type: userWithFields.type,
            //   role: userWithFields.role,
            // });

            // Email verification completed - transition to next step based on user type
            // Flow: Email Confirmation → Dashboard (user) or Onboarding (pro)
            if (userWithFields.type === 'user') {
              // Simple users: Register → Email Confirmation → Dashboard
              await prisma.user.update({
                where: { id: userWithFields.id },
                data: {
                  step: 'DASHBOARD',
                },
              });
              // Welcome email is now sent via Brevo automation when contact is added to list
            } else if (userWithFields.type === 'pro') {
              // Pro users: Register → Email Confirmation → Onboarding → Dashboard
              await prisma.user.update({
                where: { id: userWithFields.id },
                data: {
                  step: 'ONBOARDING',
                },
              });
            }
          }
        },
      },
    },
  },
  plugins: [
    admin({
      defaultRole: 'user',
      adminRoles: ['admin'],
      // Admin user IDs can be set via environment variables
      adminUserIds: process.env.ADMIN_USER_IDS?.split(',') || [],
    }),
    apiKey({
      defaultPrefix: 'doulitsa_admin_',
      minimumNameLength: 3,
      maximumNameLength: 50,
      keyExpiration: {
        defaultExpiresIn: 60 * 60 * 24 * 365, // 1 year in seconds
        minExpiresIn: 1, // 1 day minimum
        maxExpiresIn: 365, // 1 year maximum
      },
      permissions: {
        defaultPermissions: {
          admin: ['read', 'write', 'delete'],
          users: ['read', 'write', 'delete'],
          sessions: ['read', 'delete'],
        },
      },
      enableMetadata: true,
      rateLimit: {
        enabled: true,
        timeWindow: 1000 * 60 * 60, // 1 hour
        maxRequests: 1000, // 1000 requests per hour for admin operations
      },
    }),
    jwt({
      jwt: {
        // Configure JWT for Supabase RLS integration
        definePayload: ({ user }) => ({
          sub: user.id, // Standard JWT subject claim (user ID)
          email: user.email,
          role: (user as User).role || 'user',
          // Additional claims for RLS policies
          type: (user as User).type || 'user',
        }),
        expirationTime: '15m', // 15 minutes (match Supabase default)
      },
    }),
    nextCookies(), // MUST be the last plugin in the array
  ],
});
