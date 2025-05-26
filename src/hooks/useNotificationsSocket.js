'use client';

import { useEffect } from 'react';
import { io } from 'socket.io-client';

import { useNotificationsStore } from '@/stores/notifications/notificationsStore';

/**
 * Custom hook that establishes and maintains a WebSocket connection for real-time notifications.
 * Handles connection lifecycle and processes notification events to update the global store.
 *
 * @param {string|number|null} freelancerId - ID of the current freelancer, or null if not logged in
 */
export default function useNotificationsSocket(freelancerId) {
  const { setTotalUnreadMessages } = useNotificationsStore();

  useEffect(() => {
    if (!freelancerId) return;

    const serverUrl = 'https://api.doulitsa.gr';

    const socket = io(serverUrl, {
      query: { freelancerId },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socket.on('connect', () => {});
    socket.on('disconnect', () => {});
    socket.on('connect_error', (error) => {});
    socket.on('chat_updated', ({ totalUnreadCount }) => {
      if (totalUnreadCount !== undefined) {
        setTotalUnreadMessages(totalUnreadCount);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [freelancerId, setTotalUnreadMessages]);
}
