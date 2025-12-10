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

    let messagesChannel: RealtimeChannel | null = null;
    let readReceiptsChannel: RealtimeChannel | null = null;
    let mounted = true;

    // Subscribe to message changes (async function)
    // Note: subscribeToMessages is now async (uses RLS client)
    const setupSubscriptions = async () => {
      // console.log('🔌 Subscribing to messages for chat:', chatId);

      messagesChannel = await subscribeToMessages(
        chatId,
        // On new message
        (newMessage) => {
          // console.log('🔥 NEW MESSAGE RECEIVED:', newMessage);

          // Check if already processed using ref
          if (processedMessageIds.current.has(newMessage.id)) {
            // console.log('⚠️ Message already processed:', newMessage.id);
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
              replyToMessage =
                prev.find((m) => m.id === newMessage.replyToId) || null;
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
                const reactionsJson = updatedMessage.reactions as Record<
                  string,
                  string[]
                >;
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
            }),
          );
        },
        // On message delete
        (messageId) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === messageId ? { ...m, deleted: true } : m)),
          );
        },
      );

      // console.log('✅ Messages subscription created:', {
      //   channel: messagesChannel?.topic,
      //   chatId,
      // });

      // Check if component is still mounted before setting up read receipts
      if (!mounted) {
        if (messagesChannel) await unsubscribe(messagesChannel);
        return;
      }

      // Subscribe to read receipts (async function)
      readReceiptsChannel = await subscribeToReadReceipts(
        chatId,
        (messageId, userId) => {
          // If the read receipt is from the other user, mark message as read
          if (userId !== currentUserId) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === messageId ? { ...m, isRead: true } : m,
              ),
            );
          }
        },
      );

      // console.log('✅ Read receipts subscription created:', {
      //   channel: readReceiptsChannel?.topic,
      //   chatId,
      // });

      // Final check if component unmounted during setup
      if (!mounted) {
        if (messagesChannel) await unsubscribe(messagesChannel);
        if (readReceiptsChannel) await unsubscribe(readReceiptsChannel);
      }
    };

    // Start async subscription setup
    setupSubscriptions().catch((error) => {
      console.error('❌ Failed to setup chat subscriptions:', error);
    });

    // Cleanup subscriptions
    return () => {
      // console.log('🧹 Cleanup: Starting for chat:', chatId);
      mounted = false;
      activeSubscriptions.delete(subscriptionKey);

      // Async cleanup - fire and forget
      (async () => {
        if (messagesChannel) {
          // console.log('🧹 Cleanup: Unsubscribing messages channel');
          await unsubscribe(messagesChannel);
        }
        if (readReceiptsChannel) {
          // console.log('🧹 Cleanup: Unsubscribing read receipts channel');
          await unsubscribe(readReceiptsChannel);
        }
        // console.log('✅ Cleanup: Complete for chat:', chatId);
      })();
    };
  }, [chatId, currentUserId, enabled]);

  return { messages };
}
