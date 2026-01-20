/**
 * Vercel Cron Job: Check for Unread Messages
 *
 * Runs every 15 minutes to check for unread messages and send email notifications.
 * Only sends notifications for messages that haven't been emailed about yet.
 *
 * Schedule: Every 15 minutes (cron expression in vercel.json)
 * Security: Requires CRON_SECRET in Authorization header
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { sendUnreadMessagesEmail } from '@/lib/email/services/message-emails';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Security: Verify cron secret
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

    if (authHeader !== expectedAuth) {
      console.error('[Cron] Unauthorized access attempt to email notification processor');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all users (email is required field in User model)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        displayName: true,
        username: true,
      },
    });

    let notificationsSent = 0;
    let usersSkipped = 0;
    let errors = 0;

    for (const user of users) {
      try {
        // 1. Get user's chats
        const userChats = await prisma.chatMember.findMany({
          where: { uid: user.id },
          select: { chatId: true },
        });

        const chatIds = userChats.map((cm) => cm.chatId);

        if (chatIds.length === 0) {
          continue; // User has no chats
        }

        // 2. Get ALL unread messages for this user
        const unreadMessages = await prisma.message.findMany({
          where: {
            chatId: { in: chatIds },
            authorUid: { not: user.id },
            read: false,
            deleted: false,
          },
          include: {
            author: {
              select: {
                id: true,
                displayName: true,
                username: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        if (unreadMessages.length === 0) {
          continue; // No unread messages
        }

        // 3. Get ALL batches for this user to check which messages were already notified
        const allBatches = await prisma.emailBatch.findMany({
          where: {
            userId: user.id,
          },
          select: {
            messageIds: true,
          },
        });

        // 4. Create a Set of all message IDs that have been emailed before
        const alreadyNotifiedIds = new Set(
          allBatches.flatMap((batch) => batch.messageIds)
        );

        // 5. Filter out messages we've already emailed about
        const newMessages = unreadMessages.filter(
          (msg) => !alreadyNotifiedIds.has(msg.id)
        );

        if (newMessages.length === 0) {
          usersSkipped++;
          continue;
        }

        // 5. Send email notification
        await sendUnreadMessagesEmail(user, newMessages);

        // 6. Create batch record to track what we sent
        await prisma.emailBatch.create({
          data: {
            userId: user.id,
            messageIds: newMessages.map((m) => m.id),
            messageCount: newMessages.length,
            sentAt: new Date(),
          },
        });

        notificationsSent++;
      } catch (userError) {
        console.error(`[Cron] ❌ Error processing user ${user.id} (${user.email}):`, userError);
        errors++;
        continue; // Continue processing other users
      }
    }

    return NextResponse.json({
      success: true,
      totalUsers: users.length,
      notificationsSent,
      usersSkipped,
      errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] Fatal error in email notification processor:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
