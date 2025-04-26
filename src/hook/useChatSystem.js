"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import { useLazyQuery } from "@apollo/client";
import { GET_CHAT_MESSAGES } from "@/lib/graphql/queries/main/message";
import { GET_FREELANCER_CHATS } from "@/lib/graphql/queries/main/chat";
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
 * @param {Object} [params.initialChatListPagination={}] - Initial pagination info for chat list
 * @param {string|number} params.currentFreelancerId - ID of the current freelancer/user
 * @returns {Object} Chat system state and functions
 */
export function useChatSystem({
  initialChatList = [],
  initialChatListPagination = {
    page: 1,
    pageSize: 15,
    pageCount: 1,
    total: 0,
  },
  currentFreelancerId,
}) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  // Sort the initialChatList when first setting the state
  const [chatList, setChatList] = useState(
    sortChatsByLatestMessage(initialChatList)
  );
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);

  // Chat list pagination state
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [chatListPage, setChatListPage] = useState(
    initialChatListPagination.page || 1
  );
  const [chatListPageSize] = useState(initialChatListPagination.pageSize || 15);
  const [chatListPageCount, setChatListPageCount] = useState(
    initialChatListPagination.pageCount || 1
  );
  const [totalChats, setTotalChats] = useState(
    initialChatListPagination.total || 0
  );
  const [hasMoreChats, setHasMoreChats] = useState(
    (initialChatListPagination.page || 1) <
      (initialChatListPagination.pageCount || 1)
  );

  // Message pagination state
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [totalMessages, setTotalMessages] = useState(0);

  const setTotalUnreadCount = useNotificationsStore(
    (state) => state.setTotalUnreadMessages
  );

  const connectionAttemptsRef = useRef(0);
  // For tracking if a load operation is in progress
  const loadingInProgressRef = useRef(false);
  const loadingChatsInProgressRef = useRef(false);

  const [loadMessages] = useLazyQuery(GET_CHAT_MESSAGES, {
    fetchPolicy: "network-only",
  });

  const [loadChats] = useLazyQuery(GET_FREELANCER_CHATS, {
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

          // Add new message at the end (since we display oldest first)
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
   * Loads more chats for the chat list with debounce protection
   * @returns {Promise<boolean>} True if more chats were loaded, false otherwise
   */
  const loadMoreChats = useCallback(async () => {
    // Prevent multiple simultaneous load operations
    if (
      !currentFreelancerId ||
      isLoadingChats ||
      loadingChatsInProgressRef.current ||
      !hasMoreChats
    ) {
      return false;
    }

    // Set a flag to prevent duplicate load calls while scrolling
    loadingChatsInProgressRef.current = true;
    setIsLoadingChats(true);

    const nextPage = chatListPage + 1;

    try {
      const result = await loadChats({
        variables: {
          freelancerId: currentFreelancerId,
          page: nextPage,
          pageSize: chatListPageSize,
        },
      });

      if (result.data?.chats?.data) {
        const newChats = result.data.chats.data.map((chat) => ({
          id: chat.id,
          ...chat.attributes,
          lastMessage: chat.attributes.lastMessage?.data?.attributes || null,
          hasNewMessage:
            (chat.attributes.unreadCountMap?.[currentFreelancerId] || 0) > 0,
          unreadCount:
            chat.attributes.unreadCountMap?.[currentFreelancerId] || 0,
          participants:
            chat.attributes.participants?.data?.map((p) => ({
              id: p.id,
              ...p.attributes,
            })) || [],
        }));

        // Add new chats to the chat list and sort
        setChatList((prevChats) => {
          // Filter out any duplicates
          const uniqueNewChats = newChats.filter(
            (newChat) =>
              !prevChats.some((prevChat) => prevChat.id === newChat.id)
          );

          return sortChatsByLatestMessage([...prevChats, ...uniqueNewChats]);
        });

        // Update pagination state
        if (result.data.chats.meta?.pagination) {
          const { page, pageCount, total } = result.data.chats.meta.pagination;
          setChatListPage(page);
          setChatListPageCount(pageCount);
          setTotalChats(total);
          setHasMoreChats(page < pageCount);
        }

        return true;
      }
      return false;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      // Add small delay before setting loading flags to false
      setTimeout(() => {
        setIsLoadingChats(false);
        loadingChatsInProgressRef.current = false;
      }, 200);
    }
  }, [
    currentFreelancerId,
    isLoadingChats,
    hasMoreChats,
    chatListPage,
    chatListPageSize,
    loadChats,
  ]);

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
   * Loads more messages (older ones) for the current chat
   * @returns {Promise<boolean>} True if more messages were loaded, false otherwise
   */
  const loadMoreMessages = useCallback(async () => {
    if (!selectedChat || isLoadingMore || loadingInProgressRef.current) {
      return false;
    }

    const nextPage = currentPage + 1;
    setIsLoadingMore(true);
    loadingInProgressRef.current = true;

    try {
      const result = await loadMessages({
        variables: {
          chatId: selectedChat.id,
          page: nextPage,
          pageSize: pageSize,
        },
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
                displayName: msg.attributes.author.data.attributes.displayName,
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
          chatId: selectedChat.id,
        }));

        // Reverse messages to show oldest first
        const oldMessages = transformedMessages.reverse();

        // Add older messages to the beginning of the array
        setMessages((prevMessages) => [...oldMessages, ...prevMessages]);

        // Update pagination state
        const { page, pageCount } = result.data.messages.meta.pagination;
        setCurrentPage(page);
        setHasMoreMessages(page < pageCount);

        // Add a small delay before resolving to allow the DOM to update
        await new Promise((resolve) => setTimeout(resolve, 100));

        return true;
      }
      return false;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      // Add small delay before setting loading flags to false
      // This helps ensure DOM updates complete first
      setTimeout(() => {
        setIsLoadingMore(false);
        loadingInProgressRef.current = false;
      }, 200);
    }
  }, [selectedChat, isLoadingMore, currentPage, pageSize, loadMessages]);

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

      // Reset pagination when selecting a new chat
      setCurrentPage(1);
      setHasMoreMessages(false);
      loadingInProgressRef.current = false;

      try {
        if (socket?.connected) {
          socket.emit("join_chat", chat.id);
        }

        const result = await loadMessages({
          variables: {
            chatId: chat.id,
            page: 1,
            pageSize: pageSize,
          },
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

          // Reverse messages to show oldest first
          setMessages(transformedMessages.reverse());

          // Set pagination metadata
          const { page, pageCount, total } =
            result.data.messages.meta.pagination;
          // Only set hasMoreMessages to true if there are more pages
          setHasMoreMessages(page < pageCount);
          setTotalMessages(total);
        } else {
          setMessages([]);
          setHasMoreMessages(false);
          setTotalMessages(0);
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
    [socket, selectedChat, loadMessages, markChatAsRead, pageSize]
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

        // Add optimistic message at the end of the list (newest)
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
    isLoadingMore,
    hasMoreMessages,
    totalMessages,
    error,

    // Chat list pagination
    isLoadingChats,
    hasMoreChats,
    totalChats,

    // Functions
    selectChat,
    sendMessage,
    markChatAsRead,
    loadMoreMessages,
    loadMoreChats,
    currentPage,
  };
}
