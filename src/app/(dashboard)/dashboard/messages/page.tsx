import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getChats } from '@/actions/messages';
import { getDashboardMetadata } from '@/lib/seo/pages';
import { ChatSidebar } from '@/components/messages/chat-sidebar';
import { prisma } from '@/lib/prisma/client';

// Force dynamic rendering for this route (auth-protected, user-specific data)
export const dynamic = 'force-dynamic';

export const metadata = getDashboardMetadata('Μηνύματα');

export default async function MessagesIndexPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/sign-in');
  }

  // Fetch user's chats
  const chats = await getChats(session.user.id);

  // If user has chats, redirect to first chat using cid (or id as fallback)
  if (chats.length > 0) {
    const firstChat = await prisma.chat.findUnique({
      where: { id: chats[0].id },
      select: { cid: true, id: true },
    });

    if (firstChat) {
      const chatPath = firstChat.cid || firstChat.id;
      redirect(`/dashboard/messages/${chatPath}`);
    }
  }

  // No chats - show empty state
  return (
    <div className='flex h-[calc(100vh-6rem)] w-full gap-0'>
      {/* Left Sidebar - Chat List */}
      <ChatSidebar />

      {/* Right - Empty State */}
      <div className='grow'>
        <div className='flex h-full items-center justify-center'>
          <div className='text-center'>
            <p className='text-muted-foreground text-lg'>
              Δεν υπάρχουν συνομιλίες ακόμα. Ξεκινήστε μια συνομιλία!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
