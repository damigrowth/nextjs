import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { admin, apiKey } from 'better-auth/plugins';
import { User } from '@prisma/client';
import { sendAuthEmail } from '@/lib/email';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma/client';

export const auth = betterAuth({
  // Base URL and trusted origins for Vercel deployment compatibility
  // Use VERCEL_URL for dynamic preview deployments (server-side), fallback to env or localhost
  baseURL: process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  trustedOrigins: [
    'http://localhost:3000',
    'https://*.vercel.app', // Support Vercel preview deployments
    'https://doulitsa.gr', // Production domain
    'https://www.doulitsa.gr', // Production www domain
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []), // Dynamic Vercel URL
  ],
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 2 * 60, // Cache session data for 2 minutes in signed cookies for faster updates
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
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
        await sendAuthEmail('PASSWORD_RESET', user as User, url);
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
        await sendAuthEmail('VERIFICATION', user as User, url);
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
          // Extract username and displayName from Google profile for better defaults
          username: profile.email ? profile.email.split('@')[0] : null, // Use email prefix as username suggestion
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
      role: { type: 'string', defaultValue: 'user' }, // user, freelancer, company, admin
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
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, context) => {
          // console.log('CREATING USER:', user);
          // console.log('CREATING USER CONTEXT:', context);
          // console.log('CREATING USER CONTEXT BODY:', context.body);

          // Get the role and type from the request body, default to 'user'
          const requestRole = context.body?.role || 'user';
          const requestType = context.body?.type || 'user';

          // For OAuth users, provider comes from the user data (mapProfileToUser)
          // For email/password users, provider comes from request body
          const requestProvider =
            (user as any).provider || context.body?.provider || 'email';

          // console.log('DETECTED PROVIDER:', requestProvider);

          return {
            data: {
              ...user,
              role: requestRole,
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

          if (provider === 'google') {
            // OAuth Flow: Google Auth → OAuth Setup → Dashboard (user) or Onboarding (pro)
            await prisma.user.update({
              where: { id: user.id },
              data: {
                step: 'OAUTH_SETUP', // OAuth users go to setup page first
                confirmed: true, // OAuth users are pre-confirmed
                emailVerified: true, // OAuth providers have verified emails
              },
            });
          } else {
            // Email Flow: Register → Email Verification → Dashboard (user) or Onboarding (pro)
            await prisma.user.update({
              where: { id: user.id },
              data: {
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

              try {
                await sendAuthEmail('WELCOME', userWithFields);
              } catch (error) {
                console.error('Failed to send welcome email:', error);
              }
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
    nextCookies(), // MUST be the last plugin in the array
  ],
});
