/**
 * Client Component: Messages Container with real-time and auto-scroll
 * Wraps server ChatMessages component with client-side interactivity
 */

'use client';

import { useRef, useEffect } from 'react';
import { useChatSubscription } from '@/lib/hooks/chat/use-chat-subscription';
import { useMessageOptimistic } from '@/lib/hooks/chat/use-message-optimistic';
import { ChatMessages } from './chat-messages';
import type { ChatMessageItem } from '@/lib/types/messages';

interface MessagesContainerProps {
  chatId: string;
  currentUserId: string;
  initialMessages: ChatMessageItem[];
}

export function MessagesContainer({
  chatId,
  currentUserId,
  initialMessages,
}: MessagesContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

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

  // Combine real messages with optimistic messages
  const allMessages = [...realtimeMessages, ...optimisticMessages];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      // ScrollArea uses a viewport div, need to find it
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [allMessages]);

  return <ChatMessages messages={allMessages} scrollRef={scrollRef} />;
}
