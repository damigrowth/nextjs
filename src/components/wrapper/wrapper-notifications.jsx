import React from 'react';

import { getData } from '@/lib/client/operations';
import { FREELANCER_NOTIFICATIONS } from '@/lib/graphql';

import NotificationsProvider from './provider-notifications';
import { getUser } from '@/actions/shared/user';

/**
 * Server component that fetches notification data for a freelancer
 * and passes it to the client-side NotificationsProvider
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @returns {React.ReactElement} NotificationsProvider with notification data or children directly
 */
export default async function Notifications({ children }) {
  const user = await getUser();

  const freelancerId = user?.freelancer?.data?.id;

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
