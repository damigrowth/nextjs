/**
 * React Hook: useMessageOptimistic
 * Optimistic UI for instant message sending feedback
 */

'use client';

import { useState, useCallback } from 'react';
import { sendMessage } from '@/actions/messages';
import type { ChatMessageItem } from '@/lib/types/messages';

interface OptimisticMessage extends ChatMessageItem {
  optimistic?: boolean;
  sending?: boolean;
  error?: boolean;
}

interface UseMessageOptimisticOptions {
  chatId: string;
  currentUserId: string;
}

export function useMessageOptimistic({
  chatId,
  currentUserId,
}: UseMessageOptimisticOptions) {
  const [optimisticMessages, setOptimisticMessages] = useState<
    OptimisticMessage[]
  >([]);

  const sendOptimisticMessage = useCallback(
    async (content: string) => {
      // Create optimistic message
      const tempId = `temp-${Date.now()}`;
      const optimisticMsg: OptimisticMessage = {
        id: tempId,
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
        isOwn: true,
        isRead: false,
        author: {
          id: currentUserId,
          displayName: 'You',
          image: null,
        },
        edited: false,
        editedAt: null,
        deleted: false,
        replyTo: null,
        optimistic: true,
        sending: true,
      };

      // Add to optimistic messages
      setOptimisticMessages((prev) => [...prev, optimisticMsg]);

      try {
        // Send to server
        await sendMessage(chatId, content, currentUserId);

        // Mark as sent
        setOptimisticMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId ? { ...msg, sending: false } : msg
          )
        );

        // Remove after 1 second (real message will appear via subscription)
        setTimeout(() => {
          setOptimisticMessages((prev) =>
            prev.filter((msg) => msg.id !== tempId)
          );
        }, 1000);
      } catch (error) {
        console.error('Failed to send message:', error);
        // Mark as error
        setOptimisticMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId
              ? { ...msg, sending: false, error: true }
              : msg
          )
        );
      }
    },
    [chatId, currentUserId]
  );

  const retryMessage = useCallback(
    (messageId: string) => {
      const msg = optimisticMessages.find((m) => m.id === messageId);
      if (msg && msg.error) {
        // Remove old message and retry
        setOptimisticMessages((prev) =>
          prev.filter((m) => m.id !== messageId)
        );
        sendOptimisticMessage(msg.content);
      }
    },
    [optimisticMessages, sendOptimisticMessage]
  );

  return {
    optimisticMessages,
    sendOptimisticMessage,
    retryMessage,
  };
}
