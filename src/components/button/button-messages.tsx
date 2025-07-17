'use client';

import LinkNP from '@/components/link';
import { usePathname } from 'next/navigation';

import MessagesBadge from '../badge/badge-messages';
import { MessagesMenuProps } from '@/types/components';

export default function MessagesMenu({ className }: MessagesMenuProps) {
  const pathname = usePathname();

  // Don't show badge when on messages page
  const isOnMessagesPage = pathname === '/dashboard/messages';

  return (
    <div className={`d-none d-sm-flex align-items-center justify-content-center ${className || ''}`}>
      <LinkNP
        href='/dashboard/messages'
        className='position-relative text-center text-thm2 fz24 d-flex'
        aria-label='Messages'
      >
        <span className='flaticon-mail d-flex' />
        {!isOnMessagesPage && <MessagesBadge />}
      </LinkNP>
    </div>
  );
}
