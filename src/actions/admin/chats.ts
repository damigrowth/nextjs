'use server';

import { prisma } from '@/lib/prisma/client';
import type { ChatListItem } from '@/lib/types/messages';
import { transformChatForList } from '@/lib/utils/messages';
import { CHAT_LIST_SELECT } from '@/lib/database/selects';
import type { ActionResult } from '@/lib/types/api';

// ============================================================================
// Stats Types
// ============================================================================

export interface AdminChatStats {
  totalChats: number;
  totalMessages: number;
  messagesToday: number;
  totalChatMembers: number;
}

// ============================================================================
// Extended Chat List Item for Admin
// ============================================================================

export interface AdminChatListItem extends ChatListItem {
  messageCount: number;
  createdAt: Date;
  creatorUid: string;
  members: Array<{
    id: string;
    displayName: string | null;
    username: string | null;
    image: string | null;
  }>;
}

// ============================================================================
// Stats Actions
// ============================================================================

/**
 * Get admin chat statistics
 */
export async function getAdminChatStats(): Promise<ActionResult<AdminChatStats>> {
  try {
    // Get total chats
    const totalChats = await prisma.chat.count();

    // Get total messages
    const totalMessages = await prisma.message.count({
      where: {
        deleted: false,
      },
    });

    // Get messages created today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const messagesToday = await prisma.message.count({
      where: {
        deleted: false,
        createdAt: {
          gte: startOfToday,
        },
      },
    });

    // Get total chat members (unique count)
    const totalChatMembers = await prisma.chatMember.count();

    return {
      success: true,
      data: {
        totalChats,
        totalMessages,
        messagesToday,
        totalChatMembers,
      },
    };
  } catch (error) {
    console.error('Error fetching admin chat stats:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to fetch chat statistics',
    };
  }
}

// ============================================================================
// Chat List Actions
// ============================================================================

export interface GetAdminChatsParams {
  search?: string;
  sort?: 'newest' | 'oldest' | 'active';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Get all chats for admin panel with filtering and sorting
 */
export async function getAdminChats(
  params: GetAdminChatsParams = {}
): Promise<{ chats: AdminChatListItem[]; total: number }> {
  try {
    const { search, sort, sortBy, sortOrder, page = 1, limit = 50 } = params;

    // Build where clause
    const where = search
      ? {
          members: {
            some: {
              user: {
                OR: [
                  { displayName: { contains: search, mode: 'insensitive' as const } },
                  { firstName: { contains: search, mode: 'insensitive' as const } },
                  { lastName: { contains: search, mode: 'insensitive' as const } },
                  { username: { contains: search, mode: 'insensitive' as const } },
                ],
              },
            },
          },
        }
      : {};

    // Build orderBy clause
    let orderBy: any;

    // Table sorting takes precedence over filter dropdown sorting
    if (sortBy && sortOrder) {
      // Map table column keys to database fields
      switch (sortBy) {
        case 'messageCount':
          // Note: Can't sort by _count directly in Prisma, so we'll keep default
          orderBy = { lastActivity: sortOrder };
          break;
        case 'createdAt':
          orderBy = { createdAt: sortOrder };
          break;
        case 'lastActivity':
          orderBy = { lastActivity: sortOrder };
          break;
        default:
          orderBy = { lastActivity: 'desc' };
      }
    } else if (sort) {
      // Fallback to filter dropdown sorting
      switch (sort) {
        case 'newest':
          orderBy = { createdAt: 'desc' };
          break;
        case 'oldest':
          orderBy = { createdAt: 'asc' };
          break;
        case 'active':
        default:
          orderBy = { lastActivity: 'desc' };
          break;
      }
    } else {
      // Default: most active
      orderBy = { lastActivity: 'desc' };
    }

    // Fetch total count
    const total = await prisma.chat.count({ where });

    // Fetch chats with pagination
    const chats = await prisma.chat.findMany({
      where,
      select: {
        ...CHAT_LIST_SELECT,
        createdAt: true,
        creatorUid: true,
        _count: {
          select: {
            messages: {
              where: { deleted: false },
            },
          },
        },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    // Transform chats for admin display
    const adminChats: AdminChatListItem[] = chats.map((chat) => {
      // Get both members for admin view including username
      const members = chat.members.map((member) => ({
        id: member.user.id,
        displayName: member.user.displayName,
        username: member.user.username,
        image: member.user.image,
      }));

      // For transformChatForList, we need to pass a userId
      // Since this is admin view, we'll use the first member's ID as a placeholder
      const placeholderUserId = members[0]?.id || '';

      const baseChat = transformChatForList(chat as any, placeholderUserId);

      return {
        ...baseChat,
        messageCount: chat._count.messages,
        createdAt: chat.createdAt,
        creatorUid: chat.creatorUid,
        members,
      };
    });

    return {
      chats: adminChats,
      total,
    };
  } catch (error) {
    console.error('Error fetching admin chats:', error);
    throw new Error('Failed to fetch chats');
  }
}

/**
 * Get chat details by ID or CID for admin
 */
export async function getAdminChatById(chatId: string) {
  try {
    // Try to find by cid first, then by id
    const chat = await prisma.chat.findFirst({
      where: {
        OR: [
          { cid: chatId },
          { id: chatId }
        ]
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                firstName: true,
                lastName: true,
                username: true,
                image: true,
                email: true,
              },
            },
          },
        },
        lastMessage: {
          include: {
            author: {
              select: {
                displayName: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: {
              where: { deleted: false },
            },
          },
        },
      },
    });

    return chat;
  } catch (error) {
    console.error('Error fetching admin chat by ID:', error);
    throw new Error('Failed to fetch chat details');
  }
}

// ============================================================================
// Chat Detail Stats & Messages
// ============================================================================

export interface AdminChatDetailStats {
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

/**
 * Get statistics for a specific chat
 */
export async function getAdminChatDetailStats(chatId: string): Promise<ActionResult<AdminChatDetailStats>> {
  try {
    // Get the chat with members
    const chat = await prisma.chat.findFirst({
      where: {
        OR: [
          { cid: chatId },
          { id: chatId }
        ]
      },
      select: {
        id: true,
        creatorUid: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                username: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!chat) {
      return {
        success: false,
        error: 'Chat not found',
      };
    }

    // Get total messages for this chat
    const totalMessages = await prisma.message.count({
      where: {
        chatId: chat.id,
        deleted: false,
      },
    });

    // Get messages created today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const messagesToday = await prisma.message.count({
      where: {
        chatId: chat.id,
        deleted: false,
        createdAt: {
          gte: startOfToday,
        },
      },
    });

    // Get creator and member info
    const creator = chat.members.find((m) => m.uid === chat.creatorUid)?.user || null;
    const member = chat.members.find((m) => m.uid !== chat.creatorUid)?.user || null;

    return {
      success: true,
      data: {
        totalMessages,
        messagesToday,
        creator: creator ? {
          id: creator.id,
          displayName: creator.displayName,
          username: creator.username,
          image: creator.image,
        } : null,
        member: member ? {
          id: member.id,
          displayName: member.displayName,
          username: member.username,
          image: member.image,
        } : null,
      },
    };
  } catch (error) {
    console.error('Error fetching admin chat detail stats:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to fetch chat detail statistics',
    };
  }
}

export interface AdminMessageListItem {
  id: string;
  content: string;
  createdAt: Date;
  edited: boolean;
  deleted: boolean;
  isCreator: boolean;
  author: {
    id: string;
    displayName: string | null;
    username: string | null;
    image: string | null;
  };
}

export interface GetAdminChatMessagesParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Get messages for a specific chat (admin view - no auth check)
 */
export async function getAdminChatMessages(
  chatId: string,
  params: GetAdminChatMessagesParams = {}
): Promise<{ messages: AdminMessageListItem[]; total: number }> {
  try {
    const { search, sortBy, sortOrder, page = 1, limit = 12 } = params;

    // Get the actual chat ID and creatorUid (handle both cid and id)
    const chat = await prisma.chat.findFirst({
      where: {
        OR: [
          { cid: chatId },
          { id: chatId }
        ]
      },
      select: {
        id: true,
        creatorUid: true,
      },
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    // Build where clause
    const where = {
      chatId: chat.id,
      ...(search && {
        content: {
          contains: search,
          mode: 'insensitive' as const,
        },
      }),
    };

    // Build orderBy clause
    let orderBy: any;
    if (sortBy && sortOrder) {
      orderBy = { [sortBy]: sortOrder };
    } else {
      // Default: newest first
      orderBy = { createdAt: 'desc' };
    }

    // Fetch total count (including deleted for admin view)
    const total = await prisma.message.count({ where });

    // Fetch messages with pagination
    const messagesRaw = await prisma.message.findMany({
      where,
      select: {
        id: true,
        content: true,
        createdAt: true,
        edited: true,
        deleted: true,
        author: {
          select: {
            id: true,
            displayName: true,
            username: true,
            image: true,
          },
        },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    // Map messages to include isCreator flag
    const messages: AdminMessageListItem[] = messagesRaw.map((message) => ({
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      edited: message.edited,
      deleted: message.deleted,
      isCreator: message.author.id === chat.creatorUid,
      author: message.author,
    }));

    return {
      messages,
      total,
    };
  } catch (error) {
    console.error('Error fetching admin chat messages:', error);
    throw new Error('Failed to fetch chat messages');
  }
}
