import { ChatSidebar } from '@/components/messages/chat-sidebar';
import { HeaderPresence } from '@/components/messages/header-presence';
import { MessagesContainer } from '@/components/messages/messages-container';
import { MessageInput } from '@/components/messages/message-input';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getChats, getMessages } from '@/actions/messages';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma/client';
import type { ChatHeaderUser } from '@/lib/types/messages';

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ chatId?: string }>;
}) {
  // Get current user from Better Auth session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/sign-in');
  }

  // Fetch chats using server action
  const chats = await getChats(session.user.id);

  // Await searchParams before accessing properties (Next.js 15)
  const params = await searchParams;

  // Get selected chat from URL params or use first chat
  const selectedChatId = params.chatId || chats[0]?.id;

  // Fetch messages for selected chat (if any)
  const messages = selectedChatId
    ? await getMessages(selectedChatId, session.user.id)
    : [];

  // Get selected chat details for header
  const selectedChat = selectedChatId
    ? chats.find((c) => c.id === selectedChatId)
    : null;

  // Get other member's user details for header
  let headerUser: ChatHeaderUser | null = null;
  if (selectedChat && selectedChatId) {
    const otherMember = await prisma.chatMember.findFirst({
      where: {
        chatId: selectedChatId,
        uid: {
          not: session.user.id,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            firstName: true,
            lastName: true,
            image: true,
            username: true,
            profile: {
              select: {
                phone: true,
              },
            },
          },
        },
      },
    });

    if (otherMember) {
      headerUser = {
        userId: otherMember.user.id,
        displayName: otherMember.user.displayName,
        firstName: otherMember.user.firstName,
        lastName: otherMember.user.lastName,
        image: otherMember.user.image,
        username: otherMember.user.username,
        online: otherMember.online,
        phone: otherMember.user.profile?.phone || null,
      };
    }
  }

  return (
    <div className='flex h-[calc(100vh-6rem)] w-full gap-0'>
      {/* Left Sidebar - Chat List */}
      <ChatSidebar />

      {/* Right - Chat Content */}
      <div className='grow'>
        {selectedChat && headerUser ? (
          <div className='bg-background fixed inset-0 z-50 flex h-full flex-col p-4 lg:relative lg:z-10 lg:bg-transparent lg:p-0'>
            <HeaderPresence
              chatId={selectedChatId}
              currentUserId={session.user.id}
              user={headerUser}
            />
            <MessagesContainer
              chatId={selectedChatId}
              currentUserId={session.user.id}
              initialMessages={messages}
            />
            <MessageInput chatId={selectedChatId} currentUserId={session.user.id} />
          </div>
        ) : (
          <div className='flex h-full items-center justify-center'>
            <div className='text-center'>
              <p className='text-muted-foreground text-lg'>
                {chats.length === 0
                  ? 'No chats yet. Start a conversation!'
                  : 'Select a chat to start messaging'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
