// src/hook/useChatSystem.js
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import { useLazyQuery } from "@apollo/client";
import { GET_CHAT_MESSAGES } from "@/lib/graphql/queries/main/message";

export function useChatSystem({ initialChatList = [], currentFreelancerId }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chatList, setChatList] = useState(initialChatList);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState(null);

  const [loadMessages] = useLazyQuery(GET_CHAT_MESSAGES, {
    fetchPolicy: "network-only",
  });

  // Socket connection
  useEffect(() => {
    if (!currentFreelancerId) return;

    const newSocket = io(
      process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337",
      {
        query: { freelancerId: currentFreelancerId },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      }
    );

    setSocket(newSocket);

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [currentFreelancerId]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

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
      if (!message || !message.id) return;

      const currentUserIdStr = currentFreelancerId?.toString();
      const messageAuthorId = message.author?.id?.toString();

      // Update messages if in current chat
      if (
        selectedChat &&
        message.chatId.toString() === selectedChat.id.toString()
      ) {
        setMessages((prev) => {
          // Look for an optimistic message to replace
          const updatedMessages = prev.map((msg) => {
            if (
              msg.id.toString().startsWith("temp-") &&
              msg.content === message.content &&
              msg.author?.id?.toString() === messageAuthorId
            ) {
              return message; // Replace optimistic message with real one
            }
            return msg;
          });

          // If we didn't find an optimistic message to replace, check for duplicates
          const messageExists = updatedMessages.some(
            (m) => m.id.toString() === message.id.toString()
          );
          if (messageExists) {
            return updatedMessages;
          }

          // Add the new message
          return [...updatedMessages, message];
        });
      }

      // Update chat list
      setChatList((prev) =>
        prev
          .map((chat) => {
            if (chat.id.toString() === message.chatId.toString()) {
              const isAuthor = messageAuthorId === currentUserIdStr;
              const isCurrentChat =
                chat.id.toString() === selectedChat?.id?.toString();

              // If this is the current chat and we're the author, set unread to 0
              // If this is not the current chat and we're not the author, increment unread
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
          })
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      );
    };

    const handleChatUpdated = ({
      chatId,
      unreadCount,
      hasNewMessage,
      lastMessage,
    }) => {
      setChatList((prev) =>
        prev.map((chat) => {
          if (chat.id.toString() === chatId.toString()) {
            return {
              ...chat,
              unreadCount,
              hasNewMessage,
              ...(lastMessage && { lastMessage }),
            };
          }
          return chat;
        })
      );
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("new_message", handleNewMessage);
    socket.on("chat_updated", handleChatUpdated);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("new_message", handleNewMessage);
      socket.off("chat_updated", handleChatUpdated);
    };
  }, [socket, selectedChat, currentFreelancerId]);

  const markChatAsRead = useCallback(
    (chatId) => {
      if (!socket || !socket.connected || !chatId) return;

      // Emit socket event to mark chat as read
      socket.emit("mark_chat_read", { chat_id: chatId });

      // Update local state immediately for better UX
      setChatList((prev) =>
        prev.map((c) =>
          c.id.toString() === chatId.toString()
            ? { ...c, hasNewMessage: false, unreadCount: 0 }
            : c
        )
      );
    },
    [socket]
  );

  // Select chat
  const selectChat = useCallback(
    async (chat) => {
      if (!chat || chat.id === selectedChat?.id) return;

      setSelectedChat(chat);
      setIsLoadingMessages(true);

      try {
        // Join chat room
        if (socket?.connected) {
          socket.emit("join_chat", chat.id);
        }

        // Load messages
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
                  firstName: msg.attributes.author.data.attributes.firstName,
                  lastName: msg.attributes.author.data.attributes.lastName,
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
        }

        // Mark chat as read immediately when selecting it
        markChatAsRead(chat.id);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [socket, selectedChat, loadMessages, markChatAsRead]
  );

  // Send message
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

        // Find current user's data from selected chat participants
        const currentUser = selectedChat.participants?.find(
          (p) => p.id.toString() === currentFreelancerId.toString()
        );

        // Optimistic update with unique ID and proper author data
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
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
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
            // The real message will be added via socket event
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
