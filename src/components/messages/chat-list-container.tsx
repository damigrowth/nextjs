/**
 * Client Component: Chat List Container with real-time subscriptions
 * Wraps server ChatList component with real-time updates
 */

'use client';

import { useChatListSubscription } from '@/lib/hooks/chat/use-chat-list-subscription';
import { ChatList } from './chat-list';
import type { ChatListItem } from '@/lib/types/messages';

interface ChatListContainerProps {
  userId: string;
  initialChats: ChatListItem[];
}

export function ChatListContainer({
  userId,
  initialChats,
}: ChatListContainerProps) {
  // Subscribe to real-time chat list updates
  const { chats } = useChatListSubscription({
    userId,
    initialChats,
    enabled: true,
  });

  return <ChatList chats={chats} />;
}
