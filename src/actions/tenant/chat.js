'use server';

import { getData, postData } from '@/lib/client/operations';
import {
  CHECK_EXISTING_CHAT,
  CREATE_CHAT,
  CREATE_MESSAGE,
  UPDATE_CHAT,
} from '@/lib/graphql';

import { getToken } from '../auth';

/**
 * Server action that initializes a chat between users
 * This function either finds an existing chat or creates a new one,
 * then adds the initial message
 *
 * @param {Object} prevState - Previous form state (from useActionState)
 * @param {Object} formData - Data for the chat and initial message
 * @param {Object} formData.chat - Chat information
 * @param {string} formData.chat.name - Chat name
 * @param {Array<string|number>} formData.chat.participants - Array of participant IDs
 * @param {string|number} formData.chat.creator - ID of user creating the chat
 * @param {Object} formData.message - Initial message information
 * @param {string} formData.message.content - Message content
 * @param {string|number} formData.message.author - Message author ID
 * @returns {Object} Result containing success status, message and chat ID if successful
 */
export async function initializeChat(prevState, formData) {
  try {
    const chat = formData?.chat;

    const message = formData?.message;

    if (!chat?.participants || !message?.content || !message?.author) {
      return {
        message: 'Λείπουν απαραίτητες πληροφορίες',
        error: true,
        success: false,
      };
    }

    const jwt = await getToken();

    if (!jwt) {
      return {
        message: 'Απαιτείται σύνδεση',
        error: true,
        success: false,
      };
    }

    // Check existing chat
    const existingChat = await getData(
      CHECK_EXISTING_CHAT,
      {
        participant1: chat.participants[0],
        participant2: chat.participants[1],
      },
      jwt,
    );

    let chatId;

    if (existingChat?.chats?.data?.[0]) {
      chatId = existingChat.chats.data[0].id;
    } else {
      // Create new chat
      const unreadCountMap = {};

      const creatorId = chat.creator.toString();

      chat.participants.forEach((participantId) => {
        unreadCountMap[participantId.toString()] =
          participantId.toString() === creatorId ? 0 : 1;
      });

      const chatInput = {
        input: {
          name: chat.name,
          participants: chat.participants,
          creator: chat.creator,
          unreadCountMap,
          isGroup: chat.participants.length > 2,
          publishedAt: new Date().toISOString(),
        },
      };

      const newChat = await postData(CREATE_CHAT, chatInput, jwt);

      if (newChat?.error) {
        throw new Error(newChat.error);
      }
      chatId = newChat.data.createChat.data.id;
    }

    // Create message
    const messageInput = {
      input: {
        content: message.content,
        chat: chatId,
        author: message.author,
        readBy: [message.author],
        publishedAt: new Date().toISOString(),
      },
    };

    const newMessage = await postData(CREATE_MESSAGE, messageInput, jwt);

    if (newMessage?.error) {
      throw new Error(newMessage.error);
    }
    // Update chat's lastMessage
    await postData(
      UPDATE_CHAT,
      {
        id: chatId,
        data: {
          lastMessage: newMessage.data.createMessage.data.id,
        },
      },
      jwt,
    );

    return {
      message: 'Η συνομιλία ξεκίνησε με επιτυχία!',
      error: false,
      success: true,
      chatId,
    };
  } catch (error) {
    return {
      message: error.message || 'Αποτυχία έναρξης συνομιλίας',
      error: true,
      success: false,
    };
  }
}
