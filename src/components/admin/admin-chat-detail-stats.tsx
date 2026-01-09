import { MessageSquareIcon, CalendarIcon, UserIcon } from 'lucide-react';
import UserAvatar from '@/components/shared/user-avatar';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface AdminChatDetailStats {
  totalMessages: number;
  messagesToday: number;
  creator: {
    id: string;
    displayName: string | null;
    username: string | null;
    image: string | null;
  } | null;
  member: {
    id: string;
    displayName: string | null;
    username: string | null;
    image: string | null;
  } | null;
}

interface AdminChatDetailStatsProps {
  stats: AdminChatDetailStats;
}

export function AdminChatDetailStats({ stats }: AdminChatDetailStatsProps) {
  return (
    <div className='grid gap-4 px-4 md:grid-cols-2 lg:grid-cols-4 lg:px-6'>
      {/* Total Messages Card */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Messages</CardTitle>
          <MessageSquareIcon className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.totalMessages.toLocaleString()}</div>
          <p className='text-xs text-muted-foreground'>All messages in chat</p>
        </CardContent>
      </Card>

      {/* Messages Today Card */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Messages Today</CardTitle>
          <CalendarIcon className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.messagesToday.toLocaleString()}</div>
          <p className='text-xs text-muted-foreground'>Sent today</p>
        </CardContent>
      </Card>

      {/* Creator Card */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Creator</CardTitle>
          <UserIcon className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          {stats.creator ? (
            <div className='flex items-center gap-3'>
              <UserAvatar
                displayName={stats.creator.displayName}
                image={stats.creator.image}
                size='sm'
                className='h-10 w-10'
                showBorder={false}
                showShadow={false}
              />
              <div className='space-y-0.5'>
                <div className='text-sm font-medium'>
                  {stats.creator.displayName || 'Χρήστης'}
                </div>
                {stats.creator.username && (
                  <div className='text-xs text-muted-foreground'>
                    @{stats.creator.username}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className='text-xs text-muted-foreground'>No creator</p>
          )}
        </CardContent>
      </Card>

      {/* Member Card */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Member</CardTitle>
          <UserIcon className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          {stats.member ? (
            <div className='flex items-center gap-3'>
              <UserAvatar
                displayName={stats.member.displayName}
                image={stats.member.image}
                size='sm'
                className='h-10 w-10'
                showBorder={false}
                showShadow={false}
              />
              <div className='space-y-0.5'>
                <div className='text-sm font-medium'>
                  {stats.member.displayName || 'Χρήστης'}
                </div>
                {stats.member.username && (
                  <div className='text-xs text-muted-foreground'>
                    @{stats.member.username}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className='text-xs text-muted-foreground'>No member</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
