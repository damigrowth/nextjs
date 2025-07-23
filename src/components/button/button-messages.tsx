'use client';

import LinkNP from '@/components/link';
import { usePathname } from 'next/navigation';
import { Mail } from 'lucide-react';

// import MessagesBadge from '../../../oldcode/components/badge/badge-messages';

export default function MessagesMenu({ className }: { className?: string }) {
  // export default function MessagesMenu({ className }: MessagesMenuProps) {
  const pathname = usePathname();

  // Don't show badge when on messages page
  const isOnMessagesPage = pathname === '/dashboard/messages';

  return (
    <div
      className={`hidden sm:flex items-center justify-center ${className || ''}`}
    >
      <LinkNP
        href='/dashboard/messages'
        className='relative text-center flex'
        style={{ color: '#1f4b3f' }}
        aria-label='Messages'
      >
        <Mail className='w-5 h-5 flex' />
        {/* {!isOnMessagesPage && <MessagesBadge />} */}
      </LinkNP>
    </div>
  );
}
