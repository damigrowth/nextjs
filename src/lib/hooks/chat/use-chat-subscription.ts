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
  const processedMessageIds = useRef<Set<string>>(new Set());

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

    // Subscribe to message changes
    messagesChannel = subscribeToMessages(
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

          // Transform to ChatMessageItem format
          const message: ChatMessageItem = {
            id: newMessage.id,
            content: newMessage.content,
            createdAt: new Date(`${newMessage.createdAt}Z`),
            updatedAt: new Date(`${newMessage.updatedAt}Z`),
            isOwn: newMessage.authorUid === currentUserId,
            isRead: false, // Will be updated by read receipts
            author: {
              id: newMessage.authorUid,
              displayName: '', // Will be fetched or updated
              image: null,
            },
            edited: newMessage.edited || false,
            editedAt: newMessage.editedAt
              ? new Date(`${newMessage.editedAt}Z`)
              : null,
            deleted: newMessage.deleted || false,
            replyTo: null, // Will be populated if needed
          };

          return [...prev, message];
        });
      },
      // On message update (edit/delete)
      (updatedMessage) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === updatedMessage.id
              ? {
                  ...m,
                  content: updatedMessage.content,
                  edited: updatedMessage.edited || false,
                  editedAt: updatedMessage.editedAt
                    ? new Date(`${updatedMessage.editedAt}Z`)
                    : null,
                  deleted: updatedMessage.deleted || false,
                  updatedAt: new Date(`${updatedMessage.updatedAt}Z`),
                }
              : m
          )
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
    readReceiptsChannel = subscribeToReadReceipts(
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

    // Cleanup subscriptions
    return () => {
      activeSubscriptions.delete(subscriptionKey);
      if (messagesChannel) {
        unsubscribe(messagesChannel);
      }
      if (readReceiptsChannel) {
        unsubscribe(readReceiptsChannel);
      }
    };
  }, [chatId, currentUserId, enabled]);

  return { messages };
}
