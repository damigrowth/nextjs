'use client';

import { useEffect } from 'react';

import useNotificationsSocket from '@/hooks/useNotificationsSocket';
import { useNotificationsStore } from '@/stores/notifications/notificationsStore';

interface NotificationsProviderProps {
  freelancerId: string | number | null;
  totalUnreadCount: number;
  children: React.ReactNode;
}

/**
 * Client-side provider component that sets up notification handling and real-time updates.
 * Initializes the notifications store with server data and establishes socket connection.
 */
export default function NotificationsProvider({
  freelancerId,
  totalUnreadCount,
  children,
}: NotificationsProviderProps) {
  const { setTotalUnreadMessages } = useNotificationsStore();

  // Initialize store with server-provided data
  useEffect(() => {
    // Only process for logged-in users
    if (!freelancerId) return;

    const initialMessageCount = totalUnreadCount || 0;

    // Set initial message count if available
    if (initialMessageCount > 0) {
      setTotalUnreadMessages(initialMessageCount);
    }
  }, [freelancerId, totalUnreadCount, setTotalUnreadMessages]);
  // Set up and maintain socket connection if user is logged in
  useNotificationsSocket(freelancerId);

  // Always render children regardless of login state
  return children;
}
