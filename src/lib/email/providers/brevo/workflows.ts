/**
 * Brevo Workflow Automation
 *
 * Manages marketing automation workflows and user journey orchestration
 */

import { brevoClient } from './client';
import { brevoListManager } from './list-management';
import {
  BrevoWorkflow,
  BrevoTransactional,
  DoulitsaContactAttributes,
  BrevoWorkflowTrigger,
  BrevoWorkflowResponse
} from './types';
import { User, Profile, Service, Review } from '@prisma/client';
import { prisma } from '@/lib/prisma/client';
import { EMAIL_TAGS } from '@/lib/email/constants';

export class BrevoWorkflowService {
  /**
   * Trigger a workflow or transactional email for a user
   */
  async triggerWorkflow(
    workflow: BrevoWorkflow | BrevoTransactional | string,
    email: string,
    data?: Record<string, any>
  ): Promise<BrevoWorkflowResponse> {
    try {
      // For Brevo workflows that use {{ params.subject }} and {{ params.message }}
      // we send the rendered HTML and subject as parameters

      // For workflows with subject/message pattern, we send directly via Brevo API
      if (data?.subject && data?.message) {
        // Add appropriate tag based on workflow/transactional type
        let tag = workflow.toString();
        if (workflow === BrevoTransactional.SERVICE_CREATED) {
          tag = EMAIL_TAGS.SERVICE_CREATED;
        } else if (workflow === BrevoTransactional.NEW_REVIEW) {
          tag = EMAIL_TAGS.NEW_REVIEW;
        }

        try {
          // Use custom sender if provided, otherwise use default
          let sender = brevoClient.getDefaultSender();
          if (data.from) {
            // Parse "Name <email@example.com>" format
            const fromMatch = data.from.match(/^(.+?)\s*<(.+?)>$/);
            if (fromMatch) {
              sender = { name: fromMatch[1].trim(), email: fromMatch[2].trim() };
            } else {
              sender = { name: sender.name, email: data.from };
            }
          }

          const result = await brevoClient.sendTransactionalEmail({
            to: [{ email, name: data.name || email }],
            sender,
            subject: data.subject,
            htmlContent: data.message,
            textContent: data.text,
            replyTo: data.replyTo ? { email: data.replyTo } : undefined,
            tags: [tag],
          });

          return {
            success: true,
            message: `Workflow ${workflow} executed successfully (messageId: ${result.messageId})`,
          };
        } catch (sendError) {
          console.error('Failed to send email via Brevo:', sendError);
          throw sendError;
        }
      }

      // For other workflows, implement actual Brevo automation trigger
      // TODO: Implement actual workflow trigger via Brevo Automation API when configured

      return {
        success: true,
        message: `Workflow ${workflow} triggered successfully`,
      };
    } catch (error) {
      console.error(`Failed to trigger workflow ${workflow}:`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Workflow trigger failed',
      };
    }
  }

  /**
   * User registration workflow
   */
  async onUserRegistration(user: User & { profile?: Profile | null }): Promise<void> {
    try {
      // Prepare contact attributes for tracking
      const attributes: DoulitsaContactAttributes = {
        DISPLAY_NAME: user.displayName || user.firstName || user.lastName || user.username || undefined,
        USERNAME: user.username || undefined,
        USER_TYPE: user.type as 'user' | 'pro', // Type assertion for literal type
        USER_ROLE: user.role as 'user' | 'freelancer' | 'company' | 'admin', // Type assertion for literal type
        ACCOUNT_STATUS: 'active',
        REGISTRATION_DATE: new Date().toISOString(),
        IS_PRO: user.type === 'pro',
        IS_VERIFIED: user.emailVerified,
      };

      // Contact will be created when workflow is triggered with attributes

      // Trigger registration workflow
      await this.triggerWorkflow(BrevoWorkflow.USER_REGISTRATION, user.email, {
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.type,
        attributes: attributes,
      });

      // If freelancer, trigger onboarding workflow
      if (user.type === 'pro' || user.role === 'freelancer') {
        await this.triggerWorkflow(BrevoWorkflow.FREELANCER_ONBOARDING, user.email, {
          firstName: user.firstName,
          lastName: user.lastName,
        });
      }
    } catch (error) {
      console.error('Failed to handle user registration workflow:', error);
    }
  }

  /**
   * Service creation workflow
   */
  async onServiceCreated(service: Service, user: User): Promise<void> {
    try {
      // Contact attribute updates removed - using workflows only
      // Previously updated SERVICES_COUNT attribute

      // Trigger service created transactional email
      await this.triggerWorkflow(BrevoTransactional.SERVICE_CREATED, user.email, {
        serviceName: service.title,
        serviceId: service.id,
        serviceSlug: service.slug,
      });
    } catch (error) {
      console.error('Failed to handle service creation workflow:', error);
    }
  }

  /**
   * Service approval workflow
   */
  async onServiceApproved(service: Service, user: User): Promise<void> {
    try {
      // Trigger service approved transactional email
      await this.triggerWorkflow(BrevoTransactional.SERVICE_APPROVED, user.email, {
        serviceName: service.title,
        serviceId: service.id,
        serviceSlug: service.slug,
        serviceUrl: `https://doulitsa.gr/ipiresies/${service.slug}`,
      });
    } catch (error) {
      console.error('Failed to handle service approval workflow:', error);
    }
  }

  /**
   * New review workflow
   */
  async onNewReview(review: Review, serviceOwner: User, reviewer: User): Promise<void> {
    try {
      // Contact attribute updates removed - using workflows only
      // Previously updated REVIEWS_COUNT and RATING_AVERAGE attributes

      // Trigger new review transactional email for service owner
      await this.triggerWorkflow(BrevoTransactional.NEW_REVIEW, serviceOwner.email, {
        reviewerName: `${reviewer.firstName} ${reviewer.lastName}`,
        rating: review.rating,
        comment: review.comment,
      });
    } catch (error) {
      console.error('Failed to handle new review workflow:', error);
    }
  }

  /**
   * User login tracking
   */
  async onUserLogin(user: User): Promise<void> {
    try {
      // Contact attribute updates removed - using workflows only
      // Previously updated LAST_LOGIN attribute

      // Could trigger a login workflow here if needed
      // await this.triggerWorkflow(BrevoWorkflow.USER_LOGIN, user.email, {});
    } catch (error) {
      console.error('Failed to update user login:', error);
    }
  }

  /**
   * Handle inactive users
   */
  async checkInactiveUsers(): Promise<void> {
    try {
      // This would be called by a cron job
      // Query database for users inactive for 30+ days
      // Trigger re-engagement workflows

      // TODO: Implement inactive user detection and workflow trigger
    } catch (error) {
      console.error('Failed to check inactive users:', error);
    }
  }

  /**
   * Send weekly digest
   */
  async sendWeeklyDigest(user: User, data: {
    newServices: number;
    newMessages: number;
    profileViews: number;
  }): Promise<void> {
    try {
      await this.triggerWorkflow(BrevoWorkflow.WEEKLY_DIGEST, user.email, data);
    } catch (error) {
      console.error('Failed to send weekly digest:', error);
    }
  }

  /**
   * Send monthly report
   */
  async sendMonthlyReport(user: User, data: {
    totalViews: number;
    totalContacts: number;
    totalReviews: number;
    averageRating: number;
    topServices: Array<{ name: string; views: number }>;
  }): Promise<void> {
    try {
      await this.triggerWorkflow(BrevoWorkflow.MONTHLY_REPORT, user.email, data);
    } catch (error) {
      console.error('Failed to send monthly report:', error);
    }
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(
    email: string,
    preferences: {
      marketingEmails?: boolean;
      transactionalEmails?: boolean;
      weeklyDigest?: boolean;
      monthlyReport?: boolean;
    }
  ): Promise<void> {
    try {
      const attributes: Record<string, any> = {};

      if (preferences.marketingEmails !== undefined) {
        attributes.MARKETING_EMAILS = preferences.marketingEmails;
      }
      if (preferences.transactionalEmails !== undefined) {
        attributes.TRANSACTIONAL_EMAILS = preferences.transactionalEmails;
      }
      if (preferences.weeklyDigest !== undefined) {
        attributes.WEEKLY_DIGEST = preferences.weeklyDigest;
      }
      if (preferences.monthlyReport !== undefined) {
        attributes.MONTHLY_REPORT = preferences.monthlyReport;
      }

      // Contact attribute updates removed - using workflows only
      // Previously updated email preferences attributes
    } catch (error) {
      console.error('Failed to update user preferences:', error);
    }
  }

  /**
   * Sync all users to Brevo contacts
   */
  async syncAllUsers(_users: Array<User & { profile?: Profile | null }>): Promise<void> {
    try {
      // Contact sync removed - using workflows only
      // Previously synced all user attributes to Brevo contacts
      // This functionality is no longer needed since we're using workflows
    } catch (error) {
      console.error('Failed to sync users to Brevo:', error);
    }
  }

  /**
   * List Management Integration Methods
   * These methods bridge workflow triggers with list management
   */

  /**
   * Handle new user registration with list management
   * Type "user" → "users" list
   * Type "pro" → "emptyprofile" list
   */
  async handleUserRegistration(
    email: string,
    userType: 'user' | 'pro',
    attributes?: DoulitsaContactAttributes
  ): Promise<void> {
    try {
      await brevoListManager.onUserRegistration(email, userType, attributes);
    } catch (error) {
      console.error('Failed to handle user registration list management:', error);
    }
  }

  /**
   * Handle OAuth setup completion with list management
   * Pro users after OAuth → "emptyprofile" list
   */
  async handleOAuthSetupComplete(
    email: string,
    userType: 'user' | 'pro',
    attributes?: DoulitsaContactAttributes
  ): Promise<void> {
    try {
      await brevoListManager.onOAuthSetupComplete(email, userType, attributes);
    } catch (error) {
      console.error('Failed to handle OAuth setup list management:', error);
    }
  }

  /**
   * Handle onboarding completion with list management
   * emptyprofile → noservices
   */
  async handleOnboardingComplete(
    email: string,
    attributes?: DoulitsaContactAttributes
  ): Promise<void> {
    try {
      await brevoListManager.onOnboardingComplete(email, attributes);
    } catch (error) {
      console.error('Failed to handle onboarding completion list management:', error);
    }
  }

  /**
   * Handle first service creation with list management
   * noservices → pros
   */
  async handleFirstServiceCreated(
    email: string,
    attributes?: DoulitsaContactAttributes
  ): Promise<void> {
    try {
      await brevoListManager.onFirstServiceCreated(email, attributes);
    } catch (error) {
      console.error('Failed to handle first service creation list management:', error);
    }
  }

  /**
   * Handle any user state change by re-evaluating correct Brevo list placement.
   * Fetches current user state from DB and calls syncUserToCorrectList().
   * This is the universal sync method — call it after any action that changes
   * user type, step, blocked status, services, or profile.
   */
  async handleUserStateChange(userId: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          type: true,
          step: true,
          blocked: true,
          banned: true,
          displayName: true,
          username: true,
          role: true,
          profile: {
            select: {
              image: true,
              category: true,
              subcategory: true,
              _count: {
                select: {
                  services: {
                    where: { status: 'published' },
                  },
                },
              },
            },
          },
        },
      });

      if (!user) {
        console.warn(`handleUserStateChange: user ${userId} not found`);
        return;
      }

      const hasCompleteProfile = !!(
        user.profile?.image &&
        user.profile?.category &&
        user.profile?.subcategory
      );

      const publishedServiceCount = user.profile?._count?.services ?? 0;

      await brevoListManager.syncUserToCorrectList(
        user.email,
        {
          type: user.type,
          step: user.step,
          blocked: user.blocked,
          banned: user.banned ?? false,
        },
        publishedServiceCount,
        hasCompleteProfile,
        {
          DISPLAY_NAME: user.displayName || user.username || undefined,
          USERNAME: user.username || undefined,
          USER_TYPE: user.type as 'user' | 'pro',
          USER_ROLE: user.role as 'user' | 'freelancer' | 'company' | 'admin',
        }
      );
    } catch (error) {
      console.error(`Failed to handle user state change for ${userId}:`, error);
      // Don't throw — Brevo sync should never block the main operation
    }
  }
}

// Export singleton instance
export const brevoWorkflowService = new BrevoWorkflowService();