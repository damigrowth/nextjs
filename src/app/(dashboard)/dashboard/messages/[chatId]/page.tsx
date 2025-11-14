import { ChatSidebar } from '@/components/messages/chat-sidebar';
import { HeaderPresence } from '@/components/messages/header-presence';
import { MessagesContainerWithSidebar } from '@/components/messages/messages-container-with-sidebar';
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

  // Check if chat has any non-deleted messages
  const activeMessageCount = await prisma.message.count({
    where: {
      chatId: selectedChatId,
      deleted: false,
    },
  });

  // If no active messages, redirect to messages index
  if (activeMessageCount === 0) {
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
    // If no other member found, this might be a chat with a deleted user
    // or a data inconsistency. Show an error or empty state instead of redirecting
    return (
      <div className='flex h-full md:h-[calc(100vh-6rem)] w-full gap-0'>
        <div className='hidden md:block'>
          <ChatSidebar />
        </div>
        <div className='flex-1 w-full'>
          <div className='flex h-full items-center justify-center'>
            <div className='text-center'>
              <p className='text-muted-foreground text-lg'>
                Αυτή η συνομιλία δεν είναι διαθέσιμη
              </p>
              <p className='text-muted-foreground text-sm mt-2'>
                Ο άλλος χρήστης μπορεί να έχει διαγραφεί ή να μην είναι
                διαθέσιμος
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-full md:h-[calc(100vh-6rem)] w-full gap-0'>
      {/* Left Sidebar - Chat List (Hidden on mobile) */}
      <div className='hidden md:block'>
        <ChatSidebar />
      </div>

      {/* Right - Chat Content (Full width on mobile) */}
      <div className='flex-1 w-full'>
        <div
          key={selectedChatId}
          className='bg-background flex h-full flex-col'
        >
          <HeaderPresence
            chatId={selectedChatId}
            currentUserId={session.user.id}
            user={headerUser}
          />
          <MessagesContainerWithSidebar
            chatId={selectedChatId}
            currentUserId={session.user.id}
            initialMessages={messages}
            chats={chats}
          />
        </div>
      </div>
    </div>
  );
}
