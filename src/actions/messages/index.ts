/**
 * Message System Server Actions
 * All server-side operations for the messaging system
 */

// Contact form (existing)
export { submitContactForm } from './contact';

// Chat operations
export {
  getChats,
  getChatById,
  getOrCreateChat,
  deleteChat,
} from './chats';

// Message operations
export {
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  markAsRead,
  getUnreadCount,
} from './messages';

// Presence operations
export {
  updatePresence,
  getPresenceStatus,
  getUserChatsWithPresence,
} from './presence';

// Blocking operations
export {
  blockUser,
  unblockUser,
  getBlockedUsers,
  isBlocked,
} from './blocking';