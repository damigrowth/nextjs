import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { admin, apiKey } from 'better-auth/plugins';
import { PrismaClient, User } from '@prisma/client';
import { sendAuthEmail } from '@/lib/email';

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache session data for 5 minutes in signed cookies
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
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
    },
  },
  user: {
    additionalFields: {
      role: { type: 'string', defaultValue: 'user' }, // user, freelancer, company, admin
      step: { type: 'string', defaultValue: 'EMAIL_VERIFICATION' },
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
          // console.log('User creation before hook - user data:', user);
          // console.log(
          //   'User creation before hook - context body:',
          //   context.body,
          // );

          // Get the role from the request body and set it in the user data
          const requestRole = context.body?.role || 'user';

          const updatedUser = {
            ...user,
            role: requestRole, // Override the role with the one from the request
          };

          // console.log('Updated user with role:', updatedUser.role);

          return { data: updatedUser };
        },
        after: async (user) => {
          // console.log('User created - Full user object:', user);

          // Set initial step based on role
          await prisma.user.update({
            where: { id: user.id },
            data: {
              step: 'EMAIL_VERIFICATION',
              confirmed: false,
            },
          });
        },
      },
      update: {
        after: async (user) => {
          // Cast to any to access additional fields that Better Auth might not have in its types
          const userWithFields = user as any;

          // Handle email verification completion
          if (
            userWithFields.emailVerified &&
            userWithFields.step === 'EMAIL_VERIFICATION'
          ) {
            // console.log('Email verification completed for user:', {
            //   id: userWithFields.id,
            //   email: userWithFields.email,
            //   role: userWithFields.role,
            // });

            // Update user step after email verification
            if (
              userWithFields.role === 'user' ||
              userWithFields.role === 'admin'
            ) {
              // Simple users and admins go directly to dashboard
              await prisma.user.update({
                where: { id: userWithFields.id },
                data: {
                  step: 'DASHBOARD',
                  confirmed: true,
                },
              });

              try {
                await sendAuthEmail('WELCOME', userWithFields);
              } catch (error) {
                console.error('Failed to send welcome email:', error);
              }
            } else {
              // Professional users (freelancer/company) go to onboarding
              // console.log('Setting professional user step to ONBOARDING:', {
              //   userId: userWithFields.id,
              //   role: userWithFields.role,
              //   currentStep: userWithFields.step,
              // });

              const updatedUser = await prisma.user.update({
                where: { id: userWithFields.id },
                data: {
                  step: 'ONBOARDING',
                  confirmed: true,
                },
              });

              // console.log('User step updated successfully:', {
              // userId: updatedUser.id,
              // newStep: updatedUser.step,
              //   role: updatedUser.role,
              // });
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
