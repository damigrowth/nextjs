import React from 'react';

import { getData } from '@/lib/client/operations';
import { FREELANCER_NOTIFICATIONS } from '@/lib/graphql';

import NotificationsProvider from './provider-notifications';

/**
 * Server component that fetches notification data for a freelancer
 * and passes it to the client-side NotificationsProvider
 *
 * @param {Object} props - Component props
 * @param {string|null} props.freelancerId - ID of the freelancer or null if not logged in
 * @param {React.ReactNode} props.children - Child components to render
 * @returns {React.ReactElement} NotificationsProvider with notification data or children directly
 */
export default async function Notifications({ freelancerId, children }) {
  if (!freelancerId) {
    // If no freelancerId, just render children without notifications
    return <>{children}</>;
  }

  let totalUnreadCount = 0;

  try {
    const { notifications } = await getData(
      FREELANCER_NOTIFICATIONS,
      {
        freelancerId: freelancerId,
      },
      'NO_CACHE',
    );

    // Find the notification for the current user
    const userNotification = notifications?.data?.find(
      (notification) =>
        notification.attributes.freelancer.data.id === freelancerId,
    );

    // Extract totalUnreadCount safely
    totalUnreadCount = userNotification?.attributes?.totalUnreadCount || 0;
  } catch (error) {
    // Continue with totalUnreadCount = 0
  }

  return (
    <NotificationsProvider
      freelancerId={freelancerId}
      totalUnreadCount={totalUnreadCount}
    >
      {children}
    </NotificationsProvider>
  );
}
