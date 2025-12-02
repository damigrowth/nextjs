/**
 * Vercel Cron Job: Process Email Batches
 *
 * Runs every 15 minutes to check for unprocessed email batches
 * and send notification emails for batches that are 15+ minutes old.
 *
 * Schedule: Every 15 minutes (cron expression in vercel.json)
 * Security: Requires CRON_SECRET in Authorization header
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getRecentUnreadMessages } from '@/actions/messages/messages';
import { sendUnreadMessagesEmail } from '@/lib/email/services/message-emails';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Security: Verify cron secret
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

    if (authHeader !== expectedAuth) {
      console.error('[Cron] Unauthorized access attempt to email batch processor');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Cron] Starting email batch processing...');

    // Find all unprocessed email batches that are 15+ minutes old
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    const pendingBatches = await prisma.emailBatch.findMany({
      where: {
        processed: false,
        firstMessageAt: {
          lte: fifteenMinutesAgo,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            username: true,
          },
        },
      },
    });

    console.log(`[Cron] Found ${pendingBatches.length} pending email batches to process`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // Process each pending batch
    for (const batch of pendingBatches) {
      try {
        const user = batch.user;

        // Get recent unread messages for this user
        const recentUnreadMessages = await getRecentUnreadMessages(user.id, 15);

        if (recentUnreadMessages.length >= 1) {
          // Send email notification
          await sendUnreadMessagesEmail(user, recentUnreadMessages);

          // Mark batch as processed
          await prisma.emailBatch.update({
            where: { id: batch.id },
            data: {
              processed: true,
              processedAt: new Date(),
            },
          });

          const minutesElapsed = Math.floor(
            (Date.now() - new Date(batch.firstMessageAt).getTime()) / (1000 * 60)
          );

          console.log(
            `[Cron] ✅ Sent email to ${user.email} with ${recentUnreadMessages.length} messages (batch age: ${minutesElapsed} min)`
          );
          successCount++;
        } else {
          // No unread messages (might have been marked as read) - just mark batch as processed
          await prisma.emailBatch.update({
            where: { id: batch.id },
            data: {
              processed: true,
              processedAt: new Date(),
            },
          });

          console.log(
            `[Cron] ⏭️ Skipped batch for ${user.email} - no unread messages`
          );
          skipCount++;
        }
      } catch (batchError) {
        console.error(
          `[Cron] ❌ Error processing batch ${batch.id} for user ${batch.userId}:`,
          batchError
        );
        errorCount++;
        // Continue processing other batches even if one fails
      }
    }

    const summary = {
      totalBatches: pendingBatches.length,
      emailsSent: successCount,
      skipped: skipCount,
      errors: errorCount,
      timestamp: new Date().toISOString(),
    };

    console.log('[Cron] Email batch processing complete:', summary);

    return NextResponse.json({
      success: true,
      ...summary,
    });
  } catch (error) {
    console.error('[Cron] Fatal error in email batch processor:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
