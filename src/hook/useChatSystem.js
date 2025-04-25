"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import { useLazyQuery } from "@apollo/client";
import { GET_CHAT_MESSAGES } from "@/lib/graphql/queries/main/message";
import { useNotificationsStore } from "@/store/notifications/notificationsStore";

/**
 * Helper function to sort chats by most recent message timestamp
 * @param {Array} chats - Array of chat objects to sort
 * @returns {Array} Sorted array of chats
 */
const sortChatsByLatestMessage = (chats) => {
  return [...chats].sort((a, b) => {
    // Get the timestamps for comparison
    const aTimestamp = a.lastMessage?.createdAt || a.updatedAt;
    const bTimestamp = b.lastMessage?.createdAt || b.updatedAt;

    // Sort by most recent first
    return new Date(bTimestamp) - new Date(aTimestamp);
  });
};

/**
 * Real-time chat system hook that handles WebSocket connections and chat functionality
 * @param {Object} params - Hook parameters
 * @param {Array} [params.initialChatList=[]] - Initial list of chats to display
 * @param {string|number} params.currentFreelancerId - ID of the current freelancer/user
 * @returns {Object} Chat system state and functions
 */
export function useChatSystem({ initialChatList = [], currentFreelancerId }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  // Sort the initialChatList when first setting the state
  const [chatList, setChatList] = useState(
    sortChatsByLatestMessage(initialChatList)
  );
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState(null);

  const setTotalUnreadCount = useNotificationsStore(
    (state) => state.setTotalUnreadMessages
  );

  const connectionAttemptsRef = useRef(0);

  const [loadMessages] = useLazyQuery(GET_CHAT_MESSAGES, {
    fetchPolicy: "network-only",
  });

  /**
   * Set up the WebSocket connection to the chat server
   */
  useEffect(() => {
    if (!currentFreelancerId) {
      return;
    }

    const serverUrl = "https://api.doulitsa.gr";

    connectionAttemptsRef.current++;

    const newSocket = io(serverUrl, {
      query: { freelancerId: currentFreelancerId },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    newSocket.on("connect_error", () => {});
    newSocket.on("connect_timeout", () => {});
    newSocket.io.on("reconnect_attempt", () => {});
    newSocket.io.on("reconnect", () => {});

    setSocket(newSocket);

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [currentFreelancerId]);

  /**
   * Set up WebSocket event handlers for chat functionality
   */
  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleConnect = () => {
      setIsConnected(true);
      if (selectedChat) {
        socket.emit("join_chat", selectedChat.id);
      }
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleNewMessage = (message) => {
      if (!message || !message.id) {
        return;
      }

      const currentUserIdStr = currentFreelancerId?.toString();
      const messageAuthorId = message.author?.id?.toString();

      if (
        selectedChat &&
        message.chatId.toString() === selectedChat.id.toString()
      ) {
        setMessages((prev) => {
          const updatedMessages = prev.map((msg) => {
            if (
              msg.id.toString().startsWith("temp-") &&
              msg.content === message.content &&
              msg.author?.id?.toString() === messageAuthorId
            ) {
              return message;
            }
            return msg;
          });

          const messageExists = updatedMessages.some(
            (m) => m.id.toString() === message.id.toString()
          );
          if (messageExists) {
            return updatedMessages;
          }

          return [...updatedMessages, message];
        });
      }

      setChatList((prev) => {
        const chatExists = prev.some(
          (chat) => chat.id.toString() === message.chatId.toString()
        );

        if (!chatExists) {
          return prev;
        }

        // Update the chat with the new message
        const updatedList = prev.map((chat) => {
          if (chat.id.toString() === message.chatId.toString()) {
            const isAuthor = messageAuthorId === currentUserIdStr;
            const isCurrentChat =
              chat.id.toString() === selectedChat?.id?.toString();

            const newUnreadCount =
              isAuthor || isCurrentChat ? 0 : (chat.unreadCount || 0) + 1;

            return {
              ...chat,
              lastMessage: message,
              hasNewMessage: !isAuthor && !isCurrentChat,
              unreadCount: newUnreadCount,
              updatedAt: message.createdAt,
            };
          }
          return chat;
        });

        // Sort the updated list by latest message
        return sortChatsByLatestMessage(updatedList);
      });
    };

    const handleChatUpdated = ({
      chatId,
      unreadCount,
      hasNewMessage,
      lastMessage,
      totalUnreadCount,
    }) => {
      setChatList((prev) => {
        const updatedList = prev.map((chat) => {
          if (chat.id.toString() === chatId.toString()) {
            return {
              ...chat,
              unreadCount,
              hasNewMessage,
              ...(lastMessage && { lastMessage }),
            };
          }
          return chat;
        });

        // Sort after updating to maintain proper order
        return sortChatsByLatestMessage(updatedList);
      });

      if (totalUnreadCount !== undefined) {
        setTotalUnreadCount(totalUnreadCount);
      }
    };

    const handleNewChat = (chatData) => {
      const isUserInChat = chatData.participants.some(
        (p) => p.id.toString() === currentFreelancerId.toString()
      );

      if (!isUserInChat) {
        return;
      }

      setChatList((prevList) => {
        const exists = prevList.some(
          (chat) => chat.id.toString() === chatData.id.toString()
        );

        if (exists) {
          return prevList;
        }

        const newChat = {
          id: chatData.id,
          name: chatData.name,
          isGroup: chatData.isGroup,
          updatedAt: chatData.updatedAt,
          unreadCountMap: chatData.unreadCountMap,
          lastMessage: chatData.lastMessage,
          participants: chatData.participants,
          hasNewMessage: chatData.unreadCountMap?.[currentFreelancerId] > 0,
          unreadCount: chatData.unreadCountMap?.[currentFreelancerId] || 0,
        };

        // Add the new chat and sort the list
        return sortChatsByLatestMessage([...prevList, newChat]);
      });
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("new_message", handleNewMessage);
    socket.on("chat_updated", handleChatUpdated);
    socket.on("new_chat", handleNewChat);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("new_message", handleNewMessage);
      socket.off("chat_updated", handleChatUpdated);
      socket.off("new_chat", handleNewChat);
    };
  }, [socket, selectedChat, currentFreelancerId]);

  /**
   * Marks a chat as read for the current user
   * @param {string|number} chatId - ID of the chat to mark as read
   */
  const markChatAsRead = useCallback(
    (chatId) => {
      if (!socket || !socket.connected || !chatId) {
        return;
      }

      socket.emit("mark_chat_read", { chat_id: chatId });

      setChatList((prev) => {
        const updatedList = prev.map((c) =>
          c.id.toString() === chatId.toString()
            ? { ...c, hasNewMessage: false, unreadCount: 0 }
            : c
        );

        // Sort after marking as read to maintain proper order
        // This is important as we don't want marking as read to change the order
        return sortChatsByLatestMessage(updatedList);
      });
    },
    [socket]
  );

  /**
   * Selects a chat and loads its messages
   * @param {Object} chat - Chat object to select
   */
  const selectChat = useCallback(
    async (chat) => {
      if (!chat) {
        return;
      }

      if (chat.id === selectedChat?.id) {
        return;
      }

      setSelectedChat(chat);
      setIsLoadingMessages(true);

      try {
        if (socket?.connected) {
          socket.emit("join_chat", chat.id);
        }

        const result = await loadMessages({
          variables: { chatId: chat.id },
        });

        if (result.data?.messages?.data) {
          const transformedMessages = result.data.messages.data.map((msg) => ({
            id: msg.id.toString(),
            content: msg.attributes.content,
            createdAt: msg.attributes.createdAt,
            author: msg.attributes.author?.data
              ? {
                  id: msg.attributes.author.data.id.toString(),
                  username: msg.attributes.author.data.attributes.username,
                  displayName:
                    msg.attributes.author.data.attributes.displayName,
                  status: msg.attributes.author.data.attributes.status,
                  type: msg.attributes.author.data.attributes.type,
                  image: msg.attributes.author.data.attributes.image?.data
                    ? {
                        ...msg.attributes.author.data.attributes.image.data
                          .attributes,
                        id: msg.attributes.author.data.attributes.image.data.id,
                      }
                    : null,
                }
              : null,
            chatId: chat.id,
          }));

          setMessages(transformedMessages);
        } else {
          setMessages([]);
        }

        markChatAsRead(chat.id);

        // Re-sort the chat list after selecting a chat to ensure proper order
        setChatList((prev) => sortChatsByLatestMessage(prev));
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [socket, selectedChat, loadMessages, markChatAsRead]
  );

  /**
   * Sends a message to the currently selected chat
   * @param {string} content - Message content to send
   * @returns {Promise<Object>} Promise resolving to success status
   */
  const sendMessage = useCallback(
    (content) => {
      if (!socket || !selectedChat || !content.trim()) {
        return { success: false, error: "Cannot send message" };
      }

      return new Promise((resolve) => {
        const messageData = {
          chatId: selectedChat.id,
          content: content.trim(),
          authorId: currentFreelancerId,
        };

        const currentUser = selectedChat.participants?.find(
          (p) => p.id.toString() === currentFreelancerId.toString()
        );

        const optimisticId = `temp-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        const optimisticMessage = {
          id: optimisticId,
          content: content.trim(),
          createdAt: new Date().toISOString(),
          status: "sending",
          author: currentUser
            ? {
                id: currentUser.id.toString(),
                displayName: currentUser.displayName || currentUser.username,
                username: currentUser.username,
                status: currentUser.status,
                type: currentUser.type,
                image: currentUser.image?.data
                  ? {
                      ...currentUser.image.data.attributes,
                      id: currentUser.image.data.id,
                    }
                  : null,
              }
            : null,
          chatId: selectedChat.id,
        };

        setMessages((prev) => [...prev, optimisticMessage]);

        socket.emit("send_message", messageData, (response) => {
          if (response?.error) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === optimisticId
                  ? { ...msg, status: "error", error: response.error }
                  : msg
              )
            );
            resolve({ success: false, error: response.error });
          } else if (response?.success && response?.message) {
            resolve({ success: true });
          }
        });
      });
    },
    [socket, selectedChat, currentFreelancerId]
  );

  return {
    chatList,
    selectedChat,
    messages,
    isConnected,
    isLoadingMessages,
    error,
    selectChat,
    sendMessage,
    markChatAsRead,
  };
}
