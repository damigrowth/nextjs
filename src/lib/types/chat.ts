/**
 * CHAT & MESSAGE TYPE DEFINITIONS
 * Chat and messaging system types
 */

import type { User } from './user';
import type { Profile } from './profile';
import type { Media } from './user';

// Main chat interface
export interface Chat {
  id: string;
  name?: string;
  type: ChatType;
  
  // Participants
  participants: ChatParticipant[];
  createdById: string;
  
  // Last message info
  lastMessageId?: string;
  lastMessageAt?: Date;
  lastMessage?: Message;
  
  // Status
  published: boolean;
  archived: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  creator?: User;
  messages?: Message[];
  settings?: ChatSettings;
}

export type ChatType = 'direct' | 'group' | 'support';

// Chat participants
export interface ChatParticipant {
  id: string;
  chatId: string;
  userId: string;
  profileId?: string;
  role: ParticipantRole;
  joinedAt: Date;
  lastReadAt?: Date;
  lastSeenAt?: Date;
  isActive: boolean;
  muted: boolean;
  blocked: boolean;
  
  // Relations
  chat?: Chat;
  user?: User;
  profile?: Profile;
}

export type ParticipantRole = 'admin' | 'moderator' | 'member';

// Messages
export interface Message {
  id: string;
  chatId: string;
  authorId: string;
  replyToId?: string;
  
  // Message content
  content: string;
  type: MessageType;
  edited: boolean;
  editedAt?: Date;
  
  // Status
  published: boolean;
  deleted: boolean;
  deletedAt?: Date;
  
  // Delivery status
  sent: boolean;
  delivered: boolean;
  read: boolean;
  readBy: MessageRead[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  chat?: Chat;
  author?: User;
  replyTo?: Message;
  replies?: Message[];
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
}

export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video' | 'system';

// Message attachments
export interface MessageAttachment {
  id: string;
  messageId: string;
  media: Media;
  type: AttachmentType;
  order: number;
  message?: Message;
}

export type AttachmentType = 'image' | 'file' | 'audio' | 'video' | 'document';

// Message reactions
export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: Date;
  message?: Message;
  user?: User;
}

// Message read status
export interface MessageRead {
  id: string;
  messageId: string;
  userId: string;
  readAt: Date;
  message?: Message;
  user?: User;
}

// Chat settings
export interface ChatSettings {
  id: string;
  chatId: string;
  userId: string;
  
  // Notification settings
  notifications: boolean;
  soundEnabled: boolean;
  muteUntil?: Date;
  
  // Display settings
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  showReadReceipts: boolean;
  showTypingIndicators: boolean;
  
  // Privacy settings
  allowFileSharing: boolean;
  allowVoiceMessages: boolean;
  autoDeleteAfter?: number; // days
  
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  chat?: Chat;
  user?: User;
}

// Chat search and filtering
export interface ChatFilters {
  type?: ChatType;
  published?: boolean;
  archived?: boolean;
  hasUnreadMessages?: boolean;
  participantId?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  lastMessageAfter?: Date;
  lastMessageBefore?: Date;
}

export interface ChatSort {
  field: 'createdAt' | 'updatedAt' | 'lastMessageAt' | 'name';
  order: 'asc' | 'desc';
}

export interface ChatSearchParams {
  query?: string;
  filters?: ChatFilters;
  sort?: ChatSort;
  page?: number;
  limit?: number;
}

export interface ChatSearchResult {
  chats: Chat[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Message search
export interface MessageFilters {
  chatId?: string;
  authorId?: string;
  type?: MessageType;
  hasAttachments?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  published?: boolean;
  deleted?: boolean;
}

export interface MessageSearchParams {
  query?: string;
  filters?: MessageFilters;
  sort?: { field: 'createdAt' | 'updatedAt'; order: 'asc' | 'desc' };
  page?: number;
  limit?: number;
}

export interface MessageSearchResult {
  messages: Message[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Typing indicators
export interface TypingIndicator {
  chatId: string;
  userId: string;
  startedAt: Date;
  user?: User;
}

// Chat notifications
export interface ChatNotification {
  id: string;
  userId: string;
  chatId: string;
  messageId?: string;
  type: ChatNotificationType;
  title: string;
  body: string;
  read: boolean;
  data?: Record<string, any>;
  createdAt: Date;
  
  // Relations
  user?: User;
  chat?: Chat;
  message?: Message;
}

export type ChatNotificationType = 
  | 'new_message'
  | 'new_chat'
  | 'user_joined'
  | 'user_left'
  | 'chat_archived'
  | 'message_reaction'
  | 'message_reply';

// Chat analytics
export interface ChatAnalytics {
  chatId?: string;
  userId?: string;
  period: 'day' | 'week' | 'month' | 'year';
  metrics: {
    totalChats: number;
    totalMessages: number;
    activeChats: number;
    averageResponseTime: number; // minutes
    messagesPerChat: number;
    participantsPerChat: number;
  };
  trends: {
    date: Date;
    chats: number;
    messages: number;
    activeUsers: number;
  }[];
}

// Chat creation types
export interface CreateChatData {
  name?: string;
  type: ChatType;
  participantIds: string[];
  initialMessage?: string;
}

export interface UpdateChatData {
  name?: string;
  published?: boolean;
  archived?: boolean;
}

// Message creation types
export interface CreateMessageData {
  chatId: string;
  content: string;
  type?: MessageType;
  replyToId?: string;
  attachments?: File[];
}

export interface UpdateMessageData {
  content?: string;
  published?: boolean;
}

// Chat moderation
export interface ChatReport {
  id: string;
  chatId: string;
  reporterId: string;
  reason: ChatReportReason;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: Date;
  reviewedAt?: Date;
  
  // Relations
  chat?: Chat;
  reporter?: User;
}

export type ChatReportReason = 
  | 'spam'
  | 'harassment'
  | 'inappropriate_content'
  | 'fake_profile'
  | 'scam'
  | 'impersonation'
  | 'other';

// Real-time chat events
export interface ChatEvent {
  type: ChatEventType;
  chatId: string;
  userId?: string;
  data?: Record<string, any>;
  timestamp: Date;
}

export type ChatEventType = 
  | 'message_sent'
  | 'message_delivered'
  | 'message_read'
  | 'message_deleted'
  | 'user_typing'
  | 'user_stopped_typing'
  | 'user_joined'
  | 'user_left'
  | 'user_online'
  | 'user_offline'
  | 'chat_archived'
  | 'chat_unarchived';

// Chat permissions
export interface ChatPermissions {
  canSendMessages: boolean;
  canSendAttachments: boolean;
  canDeleteMessages: boolean;
  canEditMessages: boolean;
  canAddParticipants: boolean;
  canRemoveParticipants: boolean;
  canArchiveChat: boolean;
  canDeleteChat: boolean;
  canChangeSettings: boolean;
}

// Chat backup and export
export interface ChatExportOptions {
  format: 'json' | 'txt' | 'html';
  includeAttachments: boolean;
  includeSystemMessages: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ChatBackup {
  chat: Chat;
  messages: Message[];
  participants: ChatParticipant[];
  exportedAt: Date;
  metadata: {
    version: string;
    totalMessages: number;
    totalParticipants: number;
    dateRange: {
      start: Date;
      end: Date;
    };
  };
}