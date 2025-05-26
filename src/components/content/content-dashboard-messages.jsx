'use client';

import { useEffect, useRef, useState } from 'react';

import { useChatSystem } from '@/hooks/useChatSystem';

import ChatCard from '../card/card-chat';
import DashboardNavigation from '../navigation/navigation-dashboard';
import MessageBox from '../section/section-dashboard-messages';

/**
 * Helper function to scroll to the message container with header offset
 */
const scrollToMessageContainer = () => {
  setTimeout(() => {
    const container = document.getElementById('message-container');

    const header = document.getElementById('dashboard-header');

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
        behavior: 'smooth',
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
 * @param {Object} props.initialChatListPagination - Initial pagination info for chats
 * @returns {JSX.Element} Rendered message interface with chat sidebar and message area
 */
export default function MessageInfo({
  initialChatList,
  chatListError: initialChatListError,
  currentFreelancerId,
  initialChatListPagination = {
    page: 1,
    pageSize: 15,
    pageCount: 1,
    total: 0,
  },
}) {
  const {
    chatList,
    selectedChat,
    messages,
    isConnected,
    isLoadingMessages,
    isLoadingMore,
    hasMoreMessages,
    // Chat list pagination
    isLoadingChats,
    hasMoreChats,
    totalChats,
    // Functions
    error,
    selectChat,
    sendMessage,
    markChatAsRead,
    loadMoreMessages,
    loadMoreChats,
  } = useChatSystem({
    initialChatList,
    initialChatListPagination,
    currentFreelancerId,
  });

  // Track if we've handled the URL chat parameter
  const [hasProcessedUrlChat, setHasProcessedUrlChat] = useState(false);

  // Reference to the chat list scroll container
  const chatListContainerRef = useRef(null);

  /**
   * Handles URL-based chat selection when component loads or chat list changes
   */
  useEffect(() => {
    if (hasProcessedUrlChat) {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);

    const chatIdFromUrl = urlParams.get('chat');

    if (chatIdFromUrl && chatList.length > 0) {
      // Ensure we're comparing strings
      const targetChat = chatList.find(
        (chat) => chat.id.toString() === chatIdFromUrl.toString(),
      );

      if (targetChat) {
        selectChat(targetChat);
        setHasProcessedUrlChat(true);
        // Scroll to message container when selecting chat from URL
        scrollToMessageContainer();
        // Clean up URL after a short delay to ensure chat is selected
        setTimeout(() => {
          window.history.replaceState({}, '', window.location.pathname);
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

  /**
   * Handles scroll events in the chat list to implement lazy loading
   */
  const handleChatListScroll = () => {
    const container = chatListContainerRef.current;

    if (!container || isLoadingChats || !hasMoreChats) return;

    // Calculate distance from bottom (in pixels)
    const { scrollTop, scrollHeight, clientHeight } = container;

    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // Load more when user scrolls to within 200px of bottom
    if (distanceFromBottom < 200) {
      loadMoreChats();
    }
  };

  // Set up scroll listener
  useEffect(() => {
    const container = chatListContainerRef.current;

    if (container) {
      container.addEventListener('scroll', handleChatListScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleChatListScroll);
      }
    };
  }, [isLoadingChats, hasMoreChats]);

  return (
    <div className='dashboard__content hover-bgc-color'>
      <div className='row pb40'>
        <div className='col-lg-12'>
          <DashboardNavigation />
        </div>
        <div className='col-lg-12'>
          <div className='dashboard_title_area'>
            <h2>Μηνύματα</h2>
            {/* <small className="text-muted">
              Σύνδεση: {isConnected ? "✅" : "❌"} | Συνομιλίες:{" "}
              {chatList.length}/{totalChats}
            </small> */}
          </div>
        </div>
      </div>
      <div className='row mb40'>
        <div className='col-lg-6 col-xl-5 col-xxl-4'>
          <div className='message_container'>
            <div className='inbox_user_list'>
              <div
                ref={chatListContainerRef}
                className='chat-member-list pr20 Gscrollbar'
                style={{
                  scrollBehavior: 'smooth',
                }}
              >
                {initialChatListError || error ? (
                  <p className='text-danger p-3'>
                    Σφάλμα: {initialChatListError || error}
                  </p>
                ) : chatList.length > 0 ? (
                  <>
                    {chatList.map((chat) => (
                      <div
                        key={chat.id}
                        className={`list-item pt5 ${selectedChat?.id === chat.id ? 'active' : ''}`}
                        onClick={() => handleChatSelect(chat)}
                        style={{ cursor: 'pointer' }}
                      >
                        <ChatCard
                          data={chat}
                          currentFreelancerId={currentFreelancerId}
                        />
                      </div>
                    ))}
                    {/* Infinite Scroll Loading Indicator */}
                    {isLoadingChats && (
                      <div className='text-center my-3 py-2'>
                        <span
                          className='spinner-border spinner-border-sm mr-2'
                          role='status'
                          aria-hidden='true'
                        ></span>
                        <span className='text-muted'>Φόρτωση...</span>
                      </div>
                    )}
                    {/* Show end of chats message when all are loaded */}
                    {!hasMoreChats &&
                      chatList.length > 0 &&
                      !isLoadingChats && (
                        <div className='text-center my-3'>
                          <small className='text-muted'>Τέλος συνομιλιών</small>
                        </div>
                      )}
                  </>
                ) : (
                  <p className='p-3'>Δεν βρέθηκαν συνομιλίες.</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className='col-lg-6 col-xl-7 col-xxl-8'>
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
