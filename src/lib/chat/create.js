"use server";

import { CHECK_EXISTING_CHAT } from "../graphql/queries/main/chat";
import { getToken } from "../auth/token";
import { getData, postData } from "../client/operations";
import { CREATE_CHAT, CREATE_MESSAGE, UPDATE_CHAT } from "../graphql/mutations";

export async function initializeChat(prevState, formData) {
  try {
    const chat = formData?.chat;
    const message = formData?.message;

    if (!chat?.participants || !message?.content || !message?.author) {
      return {
        message: "Missing required information",
        error: true,
        success: false,
      };
    }

    const jwt = await getToken();
    if (!jwt) {
      return {
        message: "Authentication required",
        error: true,
        success: false,
      };
    }

    // Check existing chat
    const existingChat = await getData(
      CHECK_EXISTING_CHAT,
      {
        participants: chat.participants,
      },
      jwt
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

      const newChat = await postData(
        CREATE_CHAT,
        {
          input: {
            name: chat.name,
            participants: chat.participants,
            creator: chat.creator,
            unreadCountMap,
            isGroup: chat.participants.length > 2,
            publishedAt: new Date().toISOString(),
          },
        },
        jwt
      );

      if (newChat?.error) throw new Error(newChat.error);
      chatId = newChat.data.createChat.data.id;
    }

    // Create message
    const newMessage = await postData(
      CREATE_MESSAGE,
      {
        input: {
          content: message.content,
          chat: chatId,
          author: message.author,
          readBy: [message.author],
          publishedAt: new Date().toISOString(),
        },
      },
      jwt
    );

    if (newMessage?.error) throw new Error(newMessage.error);

    // Update chat's lastMessage
    await postData(
      UPDATE_CHAT,
      {
        id: chatId,
        data: {
          lastMessage: newMessage.data.createMessage.data.id,
          updatedAt: new Date().toISOString(),
        },
      },
      jwt
    );

    return {
      message: "Chat started successfully!",
      error: false,
      success: true,
      chatId,
    };
  } catch (error) {
    console.error("Error initializing chat:", error);
    return {
      message: error.message || "Failed to start chat",
      error: true,
      success: false,
    };
  }
}
