"use client";

import { useEffect, useState } from "react";
import DashboardNavigation from "../header/DashboardNavigation";
import UserChatList1 from "../card/UserChatList1";
import MessageBox from "../element/MessageBox";
import { useChatSystem } from "@/hook/useChatSystem";

/**
 * Helper function to scroll to the message container with header offset
 */
const scrollToMessageContainer = () => {
  setTimeout(() => {
    const container = document.getElementById("message-container");
    const header = document.getElementById("dashboard-header");

    if (container) {
      // Get the position of the container relative to the viewport
      const rect = container.getBoundingClientRect();

      // Calculate header height or use a fallback value of 80px if header not found
      const headerHeight = header ? header.offsetHeight : 80;

      // Add a small additional padding (20px) for visual comfort
      const offset = headerHeight + 20;

      // Calculate the position to scroll to
      // (current scroll position + element position - header height offset)
      const scrollPosition = window.pageYOffset + rect.top - offset;

      // Scroll to the calculated position
      window.scrollTo({
        top: scrollPosition,
        behavior: "smooth",
      });
    }
  }, 100);
};

/**
 * MessageInfo component that displays the chat interface with chat list and messages
 * @param {Object} props - Component props
 * @param {Array} props.initialChatList - Initial list of chats to display
 * @param {string|null} props.chatListError - Error message if chat list failed to load
 * @param {string|number} props.currentFreelancerId - ID of the current freelancer/user
 * @returns {JSX.Element} Rendered message interface with chat sidebar and message area
 */
export default function MessageInfo({
  initialChatList,
  chatListError: initialChatListError,
  currentFreelancerId,
}) {
  const {
    chatList,
    selectedChat,
    messages,
    isConnected,
    isLoadingMessages,
    isLoadingMore,
    hasMoreMessages,
    error,
    selectChat,
    sendMessage,
    markChatAsRead,
    loadMoreMessages,
  } = useChatSystem({
    initialChatList,
    currentFreelancerId,
  });

  // Track if we've handled the URL chat parameter
  const [hasProcessedUrlChat, setHasProcessedUrlChat] = useState(false);

  /**
   * Handles URL-based chat selection when component loads or chat list changes
   */
  useEffect(() => {
    if (hasProcessedUrlChat) {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const chatIdFromUrl = urlParams.get("chat");

    if (chatIdFromUrl && chatList.length > 0) {
      // Ensure we're comparing strings
      const targetChat = chatList.find(
        (chat) => chat.id.toString() === chatIdFromUrl.toString()
      );

      if (targetChat) {
        selectChat(targetChat);
        setHasProcessedUrlChat(true);

        // Scroll to message container when selecting chat from URL
        scrollToMessageContainer();

        // Clean up URL after a short delay to ensure chat is selected
        setTimeout(() => {
          window.history.replaceState({}, "", window.location.pathname);
        }, 500);
      }
    }
  }, [chatList, selectChat, hasProcessedUrlChat]);

  /**
   * Handles chat selection with proper scrolling to message container
   * @param {Object} chat - The chat to select
   */
  const handleChatSelect = (chat) => {
    selectChat(chat);
    scrollToMessageContainer();
  };

  return (
    <div className="dashboard__content hover-bgc-color">
      <div className="row pb40">
        <div className="col-lg-12">
          <DashboardNavigation />
        </div>
        <div className="col-lg-12">
          <div className="dashboard_title_area">
            <h2>Μηνύματα</h2>
            {/* <small className="text-muted">
              Σύνδεση: {isConnected ? "✅" : "❌"} | Συνομιλίες:{" "}
              {chatList.length}
            </small> */}
          </div>
        </div>
      </div>

      <div className="row mb40">
        <div className="col-lg-6 col-xl-5 col-xxl-4">
          <div className="message_container">
            <div className="inbox_user_list">
              <div className="chat-member-list pr20">
                {initialChatListError || error ? (
                  <p className="text-danger p-3">
                    Σφάλμα: {initialChatListError || error}
                  </p>
                ) : chatList.length > 0 ? (
                  chatList.map((chat) => (
                    <div
                      key={chat.id}
                      className={`list-item pt5 ${
                        selectedChat?.id === chat.id ? "active" : ""
                      }`}
                      onClick={() => handleChatSelect(chat)}
                      style={{ cursor: "pointer" }}
                    >
                      <UserChatList1
                        data={chat}
                        currentFreelancerId={currentFreelancerId}
                      />
                    </div>
                  ))
                ) : (
                  <p className="p-3">Δεν βρέθηκαν συνομιλίες.</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-6 col-xl-7 col-xxl-8">
          <MessageBox
            selectedChat={selectedChat}
            messages={messages}
            isConnected={isConnected}
            currentUserId={currentFreelancerId}
            isLoading={isLoadingMessages}
            isLoadingMore={isLoadingMore}
            hasMoreMessages={hasMoreMessages}
            onSendMessage={sendMessage}
            markChatAsRead={markChatAsRead}
            onLoadMoreMessages={loadMoreMessages}
          />
        </div>
      </div>
    </div>
  );
}
