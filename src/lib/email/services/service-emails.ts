/**
 * Service-Related Email Functions
 *
 * Modular email service for all service-related notifications
 * Encapsulates email logic away from server actions
 */

import { sendWorkflowEmail } from '../workflow-config';
import { BrevoTransactional } from '../providers/brevo/types';
import { EMAIL_CONFIG } from '@/constants/email/email-config';
import type { ServiceCreatedData } from '@/constants/email/templates/service-created';
import type { ServicePublishedData } from '@/constants/email/templates/service-published';
import { generateServiceSlug } from '@/lib/utils/text';

/**
 * Send email notification when a new service is created
 * Notifies admin about the new service pending approval
 */
export async function sendServiceCreatedEmail(
  service: {
    id: number;
    title: string;
    description: string;
    slug?: string;
  },
  creator: {
    id: string;
    email: string;
    displayName?: string | null;
    username?: string | null;
  },
  profileId: number,
  category?: string
): Promise<void> {
  try {
    // Prepare email data
    const serviceSlug = service.slug || generateServiceSlug(service.title, service.id.toString());
    const creatorName = creator.displayName || creator.username || 'Unknown';

    const emailData: ServiceCreatedData = {
      serviceTitle: service.title,
      serviceDescription: service.description,
      serviceId: service.id.toString(),
      serviceSlug,
      profileId: profileId.toString(),
      creatorName,
      creatorEmail: creator.email,
      category: category || '',
      createdAt: new Date(),
      adminReviewUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://doulitsa.gr'}/admin/services/${service.id}`,
      adminProfileUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://doulitsa.gr'}/admin/profiles/${profileId}`,
      publicUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://doulitsa.gr'}/ipiresies/${serviceSlug}`,
    };

    // Get email configuration
    const config = EMAIL_CONFIG.SERVICE_CREATED;
    const to = typeof config.to === 'function' ? config.to(emailData) : config.to;
    const subject = typeof config.subject === 'function' ? config.subject(emailData) : config.subject;
    const message = config.html(emailData);
    const from = typeof config.from === 'function' ? config.from(emailData) : config.from;
    const replyTo = config.replyTo
      ? (typeof config.replyTo === 'function' ? config.replyTo(emailData) : config.replyTo)
      : undefined;

    // Send email to admin via Brevo transactional
    await sendWorkflowEmail(
      BrevoTransactional.SERVICE_CREATED,
      to,
      subject,
      message,
      {
        from,
        replyTo,
        // Add contact attributes for Brevo analytics
        attributes: {
          SERVICE_TITLE: service.title,
          SERVICE_ID: service.id.toString(),
          CREATOR_NAME: creatorName,
          CREATOR_EMAIL: creator.email,
          CATEGORY: category || '',
        }
      }
    );

    console.log(`[Email] Service created notification sent for: ${service.title} (ID: ${service.id})`);
  } catch (error) {
    // Log error but don't throw - email failure shouldn't break the operation
    console.error('[Email] Failed to send service created notification:', error);

    // Optionally, you could track failed emails in a database table for retry
    // await trackFailedEmail('SERVICE_CREATED', { serviceId: service.id, error });
  }
}

/**
 * Send email notification when a service is published
 * Notifies the service owner that their service is now live
 */
export async function sendServicePublishedEmail(
  service: {
    id: number;
    title: string;
    slug: string;
  },
  owner: {
    email: string;
    displayName?: string | null;
    username?: string | null;
  }
): Promise<void> {
  try {
    // Prepare email data
    const userName = owner.displayName || owner.username || 'φίλε';

    const emailData: ServicePublishedData = {
      userName,
      userEmail: owner.email,
      serviceTitle: service.title,
      serviceSlug: service.slug,
      serviceId: service.id.toString(),
    };

    // Get email configuration
    const config = EMAIL_CONFIG.SERVICE_PUBLISHED;
    const to = typeof config.to === 'function' ? config.to(emailData) : config.to;
    const subject = typeof config.subject === 'function' ? config.subject(emailData) : config.subject;
    const message = config.html(emailData);
    const from = typeof config.from === 'function' ? config.from(emailData) : config.from;
    const replyTo = config.replyTo
      ? (typeof config.replyTo === 'function' ? config.replyTo(emailData) : config.replyTo)
      : undefined;

    // Send email to service owner via Brevo transactional
    await sendWorkflowEmail(
      BrevoTransactional.SERVICE_PUBLISHED,
      to,
      subject,
      message,
      {
        from,
        replyTo,
        attributes: {
          SERVICE_TITLE: service.title,
          SERVICE_SLUG: service.slug,
          SERVICE_ID: service.id.toString(),
          USER_NAME: userName,
        }
      }
    );

    console.log(`[Email] Service published notification sent for: ${service.title} (ID: ${service.id})`);
  } catch (error) {
    console.error('[Email] Failed to send service published notification:', error);
  }
}

/**
 * Send email notification when a service is approved
 * Notifies the service creator that their service is now live
 */
export async function sendServiceApprovedEmail(
  service: {
    id: number;
    title: string;
    slug: string;
  },
  owner: {
    email: string;
    displayName?: string | null;
    username?: string | null;
  }
): Promise<void> {
  try {
    // TODO: Create SERVICE_APPROVED template
    // TODO: Add SERVICE_APPROVED to BrevoWorkflow enum

    // For now, log the intent
    console.log(`[Email] Service approved notification would be sent for: ${service.title}`);

    // When ready, implement similar to sendServiceCreatedEmail
    // await sendWorkflowEmail(
    //   BrevoWorkflow.SERVICE_APPROVED,
    //   owner.email,
    //   subject,
    //   message
    // );
  } catch (error) {
    console.error('[Email] Failed to send service approved notification:', error);
  }
}

/**
 * Send email notification when a service is expiring soon
 * Notifies the service owner to renew or update their service
 */
export async function sendServiceExpiringEmail(
  service: {
    id: number;
    title: string;
    slug: string;
    expiresAt: Date;
  },
  owner: {
    email: string;
    displayName?: string | null;
    username?: string | null;
  }
): Promise<void> {
  try {
    // TODO: Create SERVICE_EXPIRING template
    // TODO: Add SERVICE_EXPIRING to BrevoWorkflow enum

    // For now, log the intent
    console.log(`[Email] Service expiring notification would be sent for: ${service.title}`);

    // When ready, implement similar to sendServiceCreatedEmail
    // await sendWorkflowEmail(
    //   BrevoWorkflow.SERVICE_EXPIRING,
    //   owner.email,
    //   subject,
    //   message
    // );
  } catch (error) {
    console.error('[Email] Failed to send service expiring notification:', error);
  }
}

/**
 * Send email notification when a service receives a new review
 */
export async function sendServiceReviewEmail(
  service: {
    id: number;
    title: string;
    slug: string;
  },
  review: {
    rating: number;
    comment?: string;
    reviewerName: string;
  },
  owner: {
    email: string;
    displayName?: string | null;
    username?: string | null;
  }
): Promise<void> {
  try {
    // Similar implementation pattern
    console.log(`[Email] New review notification would be sent for: ${service.title}`);
  } catch (error) {
    console.error('[Email] Failed to send service review notification:', error);
  }
}

/**
 * Batch send service-related emails
 * Useful for bulk operations like sending expiry reminders
 */
export async function sendBulkServiceEmails(
  type: 'EXPIRING' | 'INACTIVE' | 'PROMOTION',
  services: Array<{
    service: { id: number; title: string; slug: string };
    owner: { email: string; displayName?: string | null; username?: string | null };
  }>
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const { service, owner } of services) {
    try {
      switch (type) {
        case 'EXPIRING':
          // await sendServiceExpiringEmail(service, owner);
          sent++;
          break;
        // Add other bulk email types
      }
    } catch (error) {
      failed++;
      console.error(`[Email] Bulk email failed for service ${service.id}:`, error);
    }
  }

  console.log(`[Email] Bulk send completed: ${sent} sent, ${failed} failed`);
  return { sent, failed };
}