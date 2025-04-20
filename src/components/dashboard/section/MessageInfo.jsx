"use client";

import { useEffect } from "react";
import DashboardNavigation from "../header/DashboardNavigation";
import UserChatList1 from "../card/UserChatList1";
import MessageBox from "../element/MessageBox";
import { useChatSystem } from "@/hook/useChatSystem";

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
    error,
    selectChat,
    sendMessage,
    markChatAsRead,
  } = useChatSystem({
    initialChatList,
    currentFreelancerId,
  });

  // Handle URL-based chat selection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const chatIdFromUrl = urlParams.get("chat");

    if (chatIdFromUrl && chatList.length > 0) {
      const targetChat = chatList.find(
        (chat) => chat.id.toString() === chatIdFromUrl
      );

      if (targetChat) {
        selectChat(targetChat);
        // Clean up URL
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [chatList, selectChat]);

  return (
    <div className="dashboard__content hover-bgc-color">
      <div className="row pb40">
        <div className="col-lg-12">
          <DashboardNavigation />
        </div>
        <div className="col-lg-12">
          <div className="dashboard_title_area">
            <h2>Μηνύματα</h2>
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
                    Error: {initialChatListError || error}
                  </p>
                ) : chatList.length > 0 ? (
                  chatList.map((chat) => (
                    <div
                      key={chat.id}
                      className={`list-item pt5 ${
                        selectedChat?.id === chat.id ? "active" : ""
                      }`}
                      onClick={() => selectChat(chat)}
                      style={{ cursor: "pointer" }}
                    >
                      <UserChatList1
                        data={chat}
                        currentFreelancerId={currentFreelancerId}
                      />
                    </div>
                  ))
                ) : (
                  <p className="p-3">No chats found.</p>
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
            onSendMessage={sendMessage}
            markChatAsRead={markChatAsRead}
          />
        </div>
      </div>
    </div>
  );
}
