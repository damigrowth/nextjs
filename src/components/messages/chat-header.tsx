/**
 * Server Component: Chat Header Display
 * Pure presentation - interactive parts moved to HeaderActions client component
 */

import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import Link from 'next/link';
import { HeaderActions } from './header-actions';
import { ChatHeaderUser } from '@/lib/types/messages';
import { getProfileUrl } from '@/lib/utils/messages';
import { UserAvatar } from '../shared';

interface ChatHeaderProps {
  chatId: string;
  currentUserId: string;
  user: ChatHeaderUser;
}

export function ChatHeader({ chatId, currentUserId, user }: ChatHeaderProps) {
  const displayName =
    user.displayName || user.firstName || user.lastName || 'Unknown User';
  const profileUrl = getProfileUrl(user.username);

  return (
    <div className='sticky top-0 z-10 flex items-center justify-between bg-background py-0 px-4'>
      <div className='flex items-center gap-3'>
        <div className='relative'>
          <UserAvatar
            displayName={displayName}
            firstName={user.firstName}
            lastName={user.lastName}
            image={user.image}
            size='sm'
            className='h-9 w-9'
            showBorder={false}
            showShadow={false}
          />
          {user.online && (
            <div className='absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500' />
          )}
        </div>
        <div>
          <h2 className='text-sm font-semibold mb-0'>{displayName}</h2>
          {user.online && (
            <p className='text-xs text-green-500 font-medium'>Online</p>
          )}
        </div>
      </div>
      <div className='flex items-center gap-1'>
        {user.phone && (
          <Link href={`tel:${user.phone}`}>
            <Button size='icon' variant='ghost'>
              <Phone className='h-5 w-5' />
            </Button>
          </Link>
        )}
        <HeaderActions
          chatId={chatId}
          userId={user.userId}
          currentUserId={currentUserId}
          username={user.username}
          displayName={displayName}
          profileUrl={profileUrl}
          userType={user.type}
        />
      </div>
    </div>
  );
}
