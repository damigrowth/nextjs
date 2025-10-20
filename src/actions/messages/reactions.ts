'use server';

import { prisma } from '@/lib/prisma/client';
import { revalidatePath } from 'next/cache';

/**
 * Toggle a reaction on a message
 * Only one reaction per user per message - removes old reaction if changing to new one
 * If user already reacted with this emoji, remove it
 * If user hasn't reacted with this emoji, add it (and remove any other reactions by this user)
 */
export async function toggleReaction(
  messageId: string,
  userId: string,
  emoji: string
): Promise<{ success: boolean; reactions: Record<string, string[]> }> {
  try {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: { reactions: true, chatId: true },
    });

    if (!message) {
      throw new Error('Message not found');
    }

    // Get current reactions or initialize empty object
    const reactions = (message.reactions as Record<string, string[]>) || {};

    // Get current users for this emoji
    const currentUsers = reactions[emoji] || [];

    // Check if user already reacted with THIS specific emoji
    if (currentUsers.includes(userId)) {
      // Remove user from this emoji (toggle off)
      const updatedUsers = currentUsers.filter((id) => id !== userId);

      if (updatedUsers.length === 0) {
        // Remove emoji entirely if no users left
        delete reactions[emoji];
      } else {
        reactions[emoji] = updatedUsers;
      }
    } else {
      // Remove user from ALL other emojis (only one reaction per user)
      Object.keys(reactions).forEach((emojiKey) => {
        reactions[emojiKey] = reactions[emojiKey].filter((id) => id !== userId);

        // Clean up empty emoji arrays
        if (reactions[emojiKey].length === 0) {
          delete reactions[emojiKey];
        }
      });

      // Add user to this emoji
      reactions[emoji] = [...(reactions[emoji] || []), userId];
    }

    // Update the message
    const updated = await prisma.message.update({
      where: { id: messageId },
      data: {
        reactions: Object.keys(reactions).length > 0 ? reactions : null,
      },
      select: { reactions: true },
    });

    revalidatePath('/dashboard/messages');

    return {
      success: true,
      reactions: (updated.reactions as Record<string, string[]>) || {},
    };
  } catch (error) {
    console.error('Toggle reaction error:', error);
    throw new Error('Failed to toggle reaction');
  }
}

/**
 * Add a reaction to a message
 */
export async function addReaction(
  messageId: string,
  userId: string,
  emoji: string
): Promise<{ success: boolean }> {
  try {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: { reactions: true },
    });

    if (!message) {
      throw new Error('Message not found');
    }

    const reactions = (message.reactions as Record<string, string[]>) || {};
    const currentUsers = reactions[emoji] || [];

    // Don't add if user already reacted with this emoji
    if (currentUsers.includes(userId)) {
      return { success: true };
    }

    reactions[emoji] = [...currentUsers, userId];

    await prisma.message.update({
      where: { id: messageId },
      data: { reactions },
    });

    revalidatePath('/dashboard/messages');

    return { success: true };
  } catch (error) {
    console.error('Add reaction error:', error);
    throw new Error('Failed to add reaction');
  }
}

/**
 * Remove a reaction from a message
 */
export async function removeReaction(
  messageId: string,
  userId: string,
  emoji: string
): Promise<{ success: boolean }> {
  try {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: { reactions: true },
    });

    if (!message) {
      throw new Error('Message not found');
    }

    const reactions = (message.reactions as Record<string, string[]>) || {};
    const currentUsers = reactions[emoji] || [];

    // Remove user from this emoji
    const updatedUsers = currentUsers.filter((id) => id !== userId);

    if (updatedUsers.length === 0) {
      delete reactions[emoji];
    } else {
      reactions[emoji] = updatedUsers;
    }

    await prisma.message.update({
      where: { id: messageId },
      data: {
        reactions: Object.keys(reactions).length > 0 ? reactions : null,
      },
    });

    revalidatePath('/dashboard/messages');

    return { success: true };
  } catch (error) {
    console.error('Remove reaction error:', error);
    throw new Error('Failed to remove reaction');
  }
}
