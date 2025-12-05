/**
 * React Hook: useChat Subscription
 * Real-time updates for messages in a specific chat
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import {
  subscribeToMessages,
  subscribeToReadReceipts,
  unsubscribe,
} from '@/lib/supabase/realtime';
import type { ChatMessageItem } from '@/lib/types/messages';

// Module-level Set to track active subscriptions across all instances
const activeSubscriptions = new Set<string>();

interface UseChatSubscriptionOptions {
  chatId: string;
  currentUserId: string;
  initialMessages: ChatMessageItem[];
  enabled?: boolean;
}

export function useChatSubscription({
  chatId,
  currentUserId,
  initialMessages,
  enabled = true,
}: UseChatSubscriptionOptions) {
  const [messages, setMessages] = useState<ChatMessageItem[]>(initialMessages);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const processedMessageIds = useRef<Set<string>>(new Set());
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize processed IDs with initial messages when chatId changes
  useEffect(() => {
    processedMessageIds.current = new Set(initialMessages.map((m) => m.id));
  }, [chatId, initialMessages]);

  useEffect(() => {
    if (!enabled || !chatId) return;

    // Prevent double subscription using module-level Set
    const subscriptionKey = `${chatId}-${currentUserId}`;

    if (activeSubscriptions.has(subscriptionKey)) {
      return;
    }

    activeSubscriptions.add(subscriptionKey);

    let messagesChannel: RealtimeChannel | null;
    let readReceiptsChannel: RealtimeChannel | null;

    // Initialize subscriptions (async with error handling)
    (async () => {
      try {
        setSubscriptionError(null); // Clear previous errors

        // Subscribe to message changes
        messagesChannel = await subscribeToMessages(
      chatId,
      // On new message
      (newMessage) => {
        // Check if already processed using ref
        if (processedMessageIds.current.has(newMessage.id)) {
          return;
        }

        // Mark as processed
        processedMessageIds.current.add(newMessage.id);

        setMessages((prev) => {
          // Double-check in state as well
          if (prev.some((m) => m.id === newMessage.id)) {
            return prev;
          }

          // Find replyTo message if this is a reply
          let replyToMessage = null;
          if (newMessage.replyToId) {
            replyToMessage = prev.find((m) => m.id === newMessage.replyToId) || null;
          }

          // Transform to ChatMessageItem format
          const message: ChatMessageItem = {
            id: newMessage.id,
            content: newMessage.content,
            createdAt: new Date(`${newMessage.createdAt}Z`),
            authorUid: newMessage.authorUid,
            isOwn: newMessage.authorUid === currentUserId,
            isRead: false, // Will be updated by read receipts
            edited: newMessage.edited || false,
            editedAt: newMessage.editedAt
              ? new Date(`${newMessage.editedAt}Z`)
              : null,
            deleted: newMessage.deleted || false,
            replyToId: newMessage.replyToId || null,
            replyTo: replyToMessage,
            reactions: [], // Will be updated when reactions are added
            author: null, // Will be populated if needed
          };

          return [...prev, message];
        });
      },
      // On message update (edit/delete/reactions)
      (updatedMessage) => {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== updatedMessage.id) return m;

            // Transform reactions if present
            const reactions = [];
            if (updatedMessage.reactions) {
              const reactionsJson = updatedMessage.reactions as Record<string, string[]>;
              for (const [emoji, userIds] of Object.entries(reactionsJson)) {
                reactions.push({
                  emoji,
                  userIds,
                  count: userIds.length,
                  hasReacted: userIds.includes(currentUserId),
                });
              }
            }

            return {
              ...m,
              content: updatedMessage.content,
              edited: updatedMessage.edited || false,
              editedAt: updatedMessage.editedAt
                ? new Date(`${updatedMessage.editedAt}Z`)
                : null,
              deleted: updatedMessage.deleted || false,
              reactions,
            };
          })
        );
      },
      // On message delete
      (messageId) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId ? { ...m, deleted: true } : m
          )
        );
      }
      );

        // Subscribe to read receipts
        readReceiptsChannel = await subscribeToReadReceipts(
          chatId,
          (messageId, userId) => {
            // If the read receipt is from the other user, mark message as read
            if (userId !== currentUserId) {
              setMessages((prev) =>
                prev.map((m) => (m.id === messageId ? { ...m, isRead: true } : m))
              );
            }
          }
        );

        // If subscriptions failed (both null), set error
        if (!messagesChannel && !readReceiptsChannel) {
          setSubscriptionError('Real-time updates temporarily unavailable');
        }
      } catch (error) {
        // Handle subscription initialization errors
        const timestamp = new Date().toISOString();
        console.error(`[Chat Subscription Error ${timestamp}]`, {
          chatId,
          error: error instanceof Error ? error.message : String(error),
        });

        setSubscriptionError('Failed to establish real-time connection');

        // Retry after 5 seconds
        retryTimeoutRef.current = setTimeout(() => {
          if (enabled && chatId) {
            console.info(`[Chat Subscription Retry ${timestamp}]`, { chatId });
            // Trigger re-subscription by clearing error
            setSubscriptionError(null);
          }
        }, 5000);
      }
    })();

    // Cleanup subscriptions
    return () => {
      activeSubscriptions.delete(subscriptionKey);

      // Clear retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }

      // Unsubscribe channels
      if (messagesChannel) {
        unsubscribe(messagesChannel);
      }
      if (readReceiptsChannel) {
        unsubscribe(readReceiptsChannel);
      }
    };
  }, [chatId, currentUserId, enabled]);

  return { messages, subscriptionError };
}
