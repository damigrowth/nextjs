import { Chat, Message, ChatMember, MessageRead, User } from '@prisma/client';
import type { MessageReaction } from '@/lib/prisma/json-types';

// Re-export MessageReaction for external use
export type { MessageReaction };

// ============================================================================
// Chat Types
// ============================================================================

/**
 * Chat with all necessary relations for displaying in chat list
 */
export type ChatWithRelations = Chat & {
  lastMessage: Message | null;
  members: (ChatMember & {
    user: Pick<User, 'id' | 'displayName' | 'firstName' | 'lastName' | 'image'>;
  })[];
  _count: {
    messages: number;
  };
};

/**
 * Transformed chat data for UI display in chat list
 */
export interface ChatListItem {
  id: string; // Chat.id
  cid: string | null; // Chat.cid (for URL routing) - nullable during migration
  name: string; // Computed from other member's user data
  avatar: string | null; // From other member's User.image
  lastMessage: string | null; // Chat.lastMessage.content
  lastActivity: Date; // Chat.lastActivity
  unread: number; // Computed count of unread messages
  online: boolean; // From ChatMember.online (other member)
  otherMemberId: string; // User.id of the other participant
}

// ============================================================================
// Message Types
// ============================================================================

/**
 * Message with all necessary relations for displaying in chat
 */
export type MessageWithRelations = Message & {
  author: Pick<User, 'id' | 'displayName' | 'firstName' | 'lastName' | 'image'>;
  readBy: MessageRead[];
  replyTo:
    | (Message & {
        author: Pick<User, 'displayName' | 'firstName' | 'lastName'>;
      })
    | null;
};

/**
 * Transformed message data for UI display in chat messages
 */
export interface ChatMessageItem {
  id: string; // Message.id
  content: string; // Message.content
  createdAt: Date; // Message.createdAt
  edited: boolean; // Message.edited
  editedAt: Date | null; // Message.editedAt
  deleted: boolean; // Message.deleted
  authorUid: string; // Message.authorUid
  isOwn: boolean; // Computed: authorUid === currentUserId
  isRead: boolean; // Computed: readBy includes currentUser
  replyToId: string | null; // Message.replyToId
  replyTo: {
    // For displaying quoted message
    id: string;
    content: string;
    author: Pick<User, 'displayName' | 'firstName' | 'lastName'> | null;
  } | null;
  reactions: MessageReaction[]; // Transformed reactions for display
  author: Pick<
    User,
    'id' | 'displayName' | 'firstName' | 'lastName' | 'image'
  > | null;
}

// ============================================================================
// User Types for Chat
// ============================================================================

/**
 * Chat participant with presence info
 */
export interface ChatParticipant {
  userId: string; // User.id
  displayName: string | null; // User.displayName
  firstName: string | null; // User.firstName
  lastName: string | null; // User.lastName
  image: string | null; // User.image
  username: string | null; // User.username
  online: boolean; // ChatMember.online
  lastSeen: Date; // ChatMember.lastSeen
}

/**
 * Minimal user info for chat header
 */
export interface ChatHeaderUser {
  userId: string;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  image: string | null;
  username: string | null;
  online: boolean;
  phone: string | null; // From User.profile.phone
  type: string | null; // User type: 'user' or 'pro'
}
