import { ChatSidebar } from '@/components/messages/chat-sidebar';
import { HeaderPresence } from '@/components/messages/header-presence';
import { MessagesContainer } from '@/components/messages/messages-container';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getChats, getMessages } from '@/actions/messages';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma/client';
import type { ChatHeaderUser } from '@/lib/types/messages';
import { getDashboardMetadata } from '@/lib/seo/pages';

// Force dynamic rendering for this route (auth-protected, user-specific data)
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export const metadata = getDashboardMetadata('Μηνύματα');

interface MessagesPageProps {
  params: Promise<{ chatId: string }>;
}

export default async function MessagesPage({ params }: MessagesPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/sign-in');
  }

  // Await params (Next.js 15)
  const { chatId } = await params;

  // Find chat by cid first, then fall back to id (for migration compatibility)
  let chat = await prisma.chat.findUnique({
    where: { cid: chatId },
    select: { id: true },
  });

  // If not found by cid, try by id (fallback during migration)
  if (!chat) {
    chat = await prisma.chat.findUnique({
      where: { id: chatId },
      select: { id: true },
    });
  }

  if (!chat) {
    notFound();
  }

  const selectedChatId = chat.id;

  // Verify user is a member of this chat
  const isMember = await prisma.chatMember.findUnique({
    where: {
      chatId_uid: {
        chatId: selectedChatId,
        uid: session.user.id,
      },
    },
  });

  if (!isMember) {
    redirect('/dashboard/messages');
  }

  // Fetch all chats for sidebar
  const chats = await getChats(session.user.id);

  // Fetch messages for selected chat
  const messages = await getMessages(selectedChatId, session.user.id);

  // Get selected chat details
  const selectedChat = chats.find((c) => c.id === selectedChatId);

  // Get other member's user details for header
  let headerUser: ChatHeaderUser | null = null;
  if (selectedChat) {
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
            type: true,
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
        type: otherMember.user.type,
      };
    }
  }

  if (!headerUser) {
    redirect('/dashboard/messages');
  }

  return (
    <div className='flex h-[calc(100vh-6rem)] w-full gap-0'>
      {/* Left Sidebar - Chat List */}
      <ChatSidebar />

      {/* Right - Chat Content */}
      <div className='grow'>
        <div
          key={selectedChatId}
          className='bg-background fixed inset-0 z-50 flex h-full flex-col p-4 lg:relative lg:z-10 lg:bg-transparent lg:p-0'
        >
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
        </div>
      </div>
    </div>
  );
}
