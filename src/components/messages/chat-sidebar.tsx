import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { ChatListContainer } from './chat-list-container';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getChats } from '@/actions/messages';

export async function ChatSidebar() {
  // Get current user session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Fetch real chats if user is authenticated
  const chats = session?.user ? await getChats(session.user.id) : [];
  const hasChats = chats.length > 0;

  return (
    <Card className='bg-card text-card-foreground flex flex-col gap-6 rounded-xl border shadow-none py-6 w-full h-full pb-0 lg:w-96'>
      <CardHeader className='@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 py-0 has-[data-slot=card-action]:grid-cols-[1fr_auto] '>
        <div className='flex items-center justify-between mb-4'>
          <CardTitle className='font-semibold font-display text-xl lg:text-2xl'>
            Μηνύματα
          </CardTitle>
          <Button size='icon' variant='ghost' className='rounded-full border'>
            <Plus className='h-4 w-4' />
          </Button>
        </div>
        <CardDescription className='relative'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Αναζήτηση συνομιλιών...'
            className='pl-8'
            disabled={!hasChats}
          />
        </CardDescription>
      </CardHeader>
      <CardContent className='flex-1 overflow-hidden p-0'>
        {session?.user && (
          <ChatListContainer userId={session.user.id} initialChats={chats} />
        )}
      </CardContent>
    </Card>
  );
}
