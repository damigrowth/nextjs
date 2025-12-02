/**
 * Client Component: Messages Container with real-time and auto-scroll
 * Wraps server ChatMessages component with client-side interactivity
 */

'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useChatSubscription } from '@/lib/hooks/chat/use-chat-subscription';
import { useMessageOptimistic } from '@/lib/hooks/chat/use-message-optimistic';
import { getMessages, markAsRead } from '@/actions/messages';
import { ChatMessages } from './chat-messages';
import { MessageInput, ReplyToMessage, EditingMessage } from './message-input';
import { Loader2 } from 'lucide-react';
import type { ChatMessageItem } from '@/lib/types/messages';

interface MessagesContainerProps {
  chatId: string;
  currentUserId: string;
  initialMessages: ChatMessageItem[];
  chats?: any[]; // For mobile sidebar
}

export function MessagesContainer({
  chatId,
  currentUserId,
  initialMessages,
  chats,
}: MessagesContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadTriggerRef = useRef<HTMLDivElement>(null);
  const [replyTo, setReplyTo] = useState<ReplyToMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<EditingMessage | null>(null);
  const [olderMessages, setOlderMessages] = useState<ChatMessageItem[]>([]);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(initialMessages.length >= 50);

  // Subscribe to real-time message updates
  const { messages: realtimeMessages } = useChatSubscription({
    chatId,
    currentUserId,
    initialMessages,
    enabled: true,
  });

  // Get optimistic messages for instant feedback
  const { optimisticMessages } = useMessageOptimistic({
    chatId,
    currentUserId,
  });

  // Mark messages as read when chat opens
  useEffect(() => {
    const markChatAsRead = async () => {
      // Get all unread messages (messages not sent by current user and not already read)
      const unreadMessageIds = initialMessages
        .filter(m => !m.isOwn && !m.isRead)
        .map(m => m.id);

      // Mark them as read if there are any
      if (unreadMessageIds.length > 0) {
        try {
          await markAsRead(unreadMessageIds, currentUserId);
        } catch (error) {
          console.error('Failed to mark messages as read:', error);
        }
      }
    };

    markChatAsRead();
  }, [chatId, currentUserId]); // Run when chatId changes (new chat opened)

  // Auto-mark new real-time messages as read when they arrive
  useEffect(() => {
    const markNewMessagesAsRead = async () => {
      // Get unread messages from real-time subscription (not sent by current user)
      const unreadMessageIds = realtimeMessages
        .filter(m => !m.isOwn && !m.isRead)
        .map(m => m.id);

      // Mark new messages as read since user has this chat open
      if (unreadMessageIds.length > 0) {
        try {
          await markAsRead(unreadMessageIds, currentUserId);
        } catch (error) {
          console.error('Failed to mark new messages as read:', error);
        }
      }
    };

    markNewMessagesAsRead();
  }, [realtimeMessages, currentUserId]); // Run when new real-time messages arrive

  // Load older messages when scrolling to top
  const loadOlderMessages = useCallback(async () => {
    if (isLoadingOlder || !hasMore) return;

    setIsLoadingOlder(true);

    try {
      // Get the oldest message from all current messages
      const allCurrentMessages = [...olderMessages, ...realtimeMessages];
      const oldestMessage = allCurrentMessages[0];

      if (!oldestMessage) {
        setHasMore(false);
        return;
      }

      const beforeDate = oldestMessage.createdAt instanceof Date
        ? oldestMessage.createdAt.toISOString()
        : oldestMessage.createdAt;

      // Fetch older messages
      const fetchedOlderMessages = await getMessages(chatId, currentUserId, {
        limit: 50,
        before: beforeDate,
      });

      if (fetchedOlderMessages.length === 0) {
        setHasMore(false);
      } else {
        // Prepend older messages
        setOlderMessages((prev) => [...fetchedOlderMessages, ...prev]);

        // If we got fewer messages than the limit, we've reached the end
        if (fetchedOlderMessages.length < 50) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Failed to load older messages:', error);
      setHasMore(false);
    } finally {
      setIsLoadingOlder(false);
    }
  }, [chatId, currentUserId, olderMessages, realtimeMessages, isLoadingOlder, hasMore]);

  // Combine all messages: older + realtime + optimistic
  // Use useMemo to prevent unnecessary re-renders that trigger Next.js route cache
  const allMessages = useMemo(
    () => [...olderMessages, ...realtimeMessages, ...optimisticMessages],
    [olderMessages, realtimeMessages, optimisticMessages]
  );

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (!loadTriggerRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoadingOlder) {
          loadOlderMessages();
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0.1,
      }
    );

    observer.observe(loadTriggerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [loadOlderMessages, hasMore, isLoadingOlder]);

  // Auto-scroll to bottom when NEW messages arrive (not when loading older)
  const prevMessageCountRef = useRef(allMessages.length);
  useEffect(() => {
    if (scrollRef.current && allMessages.length > prevMessageCountRef.current) {
      // Only scroll if we got new messages (not older ones)
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
    prevMessageCountRef.current = allMessages.length;
  }, [allMessages]);

  return (
    <>
      <ChatMessages
        messages={allMessages}
        scrollRef={scrollRef}
        currentUserId={currentUserId}
        onReply={setReplyTo}
        onEdit={setEditingMessage}
        loadTriggerRef={loadTriggerRef}
        isLoadingOlder={isLoadingOlder}
        hasMore={hasMore}
      />
      <MessageInput
        chatId={chatId}
        currentUserId={currentUserId}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        editingMessage={editingMessage}
        onCancelEdit={() => setEditingMessage(null)}
        chats={chats}
      />
    </>
  );
}
