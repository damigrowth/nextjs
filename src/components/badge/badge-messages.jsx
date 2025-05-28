'use client';

import { useNotificationsStore } from '@/stores/notifications/notificationsStore';

export default function MessagesBadge() {
  const { totalUnreadMessages } = useNotificationsStore();

  // Don't show anything if no unread messages
  if (totalUnreadMessages === 0) {
    return null;
  }

  // Format for display (99+ for large numbers)
  const displayCount = totalUnreadMessages > 99 ? '99+' : totalUnreadMessages;

  return (
    <span
      className='position-absolute badge rounded-pill bg-danger'
      style={{
        top: '-6px',
        right: '-8px',
        fontSize: '10px',
        minWidth: '18px',
        height: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 4px',
      }}
      aria-label={`${totalUnreadMessages} unread messages`}
    >
      {displayCount}
    </span>
  );
}
