import { MessageSquareIcon, MessageCircleIcon, CalendarIcon, UsersIcon } from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface AdminChatStats {
  totalChats: number;
  totalMessages: number;
  messagesToday: number;
  totalChatMembers: number;
}

interface AdminChatsStatsProps {
  stats: AdminChatStats;
}

export function AdminChatsStats({ stats }: AdminChatsStatsProps) {
  return (
    <div className='grid gap-4 px-4 md:grid-cols-2 lg:grid-cols-4 lg:px-6'>
      {/* Total Chats Card */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Chats</CardTitle>
          <MessageSquareIcon className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.totalChats.toLocaleString()}</div>
          <p className='text-xs text-muted-foreground'>Active conversations</p>
        </CardContent>
      </Card>

      {/* Total Messages Card */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Messages</CardTitle>
          <MessageCircleIcon className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.totalMessages.toLocaleString()}</div>
          <p className='text-xs text-muted-foreground'>All time messages</p>
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

      {/* Total Chat Members Card */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Chat Members</CardTitle>
          <UsersIcon className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.totalChatMembers.toLocaleString()}</div>
          <p className='text-xs text-muted-foreground'>Unique participants</p>
        </CardContent>
      </Card>
    </div>
  );
}
