'use client';

import { useEffect, useRef, useState } from 'react';
import LinkNP from '@/components/link';

import { UserImage } from '@/components/avatar';
import { ChatMessagesSkeleton } from '@/components/skeleton';
import {
  formatCompactMessageTime,
  formatMessageTime,
  getDatePart,
  timeAgo,
} from '@/utils/timeAgo';
import { ArrowRightLong } from '@/components/icon/fa';
import { getImage } from '@/utils/image';

/**
 * Converts URLs in text to clickable links that open in a new tab
 * @param {string} text - Text that may contain URLs
 * @returns {Array} Array of text and link elements
 */
const convertLinksToAnchors = (text) => {
  if (!text) return '';

  // URL regex pattern
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  let lastIndex = 0;

  let match;

  const result = [];

  // Find all matches and build result array properly
  while ((match = urlRegex.exec(text)) !== null) {
    // Add text before the URL
    if (match.index > lastIndex) {
      result.push(text.substring(lastIndex, match.index));
    }
    // Add the URL as a link
    result.push(
      <a
        key={match.index}
        href={match[0]}
        target='_blank'
        rel='noopener noreferrer'
        className='text-thm'
      >
        {match[0]}
      </a>,
    );
    lastIndex = match.index + match[0].length;
  }
  // Add remaining text after the last URL
  if (lastIndex < text.length) {
    result.push(text.substring(lastIndex));
  }

  return result;
};

/**
 * MessageBox component that displays chat messages and message input
 * @param {Object} props - Component props
 * @param {Object|null} props.selectedChat - Currently selected chat
 * @param {Array} props.messages - List of messages in the chat
 * @param {boolean} props.isConnected - Whether the socket connection is active
 * @param {string|number} props.currentUserId - ID of the current user
 * @param {boolean} props.isLoading - Whether messages are currently loading
 * @param {boolean} props.isLoadingMore - Whether more messages are being loaded
 * @param {boolean} props.hasMoreMessages - Whether more messages can be loaded
 * @param {Function} props.onSendMessage - Callback to send a message
 * @param {Function} props.markChatAsRead - Callback to mark a chat as read
 * @param {Function} props.onLoadMoreMessages - Callback to load more messages
 * @returns {JSX.Element} Rendered message box component
 */
export default function MessageBox({
  selectedChat,
  messages,
  isConnected,
  currentUserId,
  isLoading,
  isLoadingMore,
  hasMoreMessages,
  onSendMessage,
  markChatAsRead,
  onLoadMoreMessages,
}) {
  const [newMessage, setNewMessage] = useState('');

  const [isSending, setIsSending] = useState(false);

  const [sendError, setSendError] = useState(null);

  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  // Simple flag to prevent auto-scroll during load more
  const [isLoadingMoreLocal, setIsLoadingMoreLocal] = useState(false);

  // References to DOM elements
  const messagesEndRef = useRef(null);

  const messageInputRef = useRef(null);

  const chatContainerRef = useRef(null);

  // Store scroll position and height for restoration
  const scrollPositionRef = useRef({ top: 0, height: 0 });

  // Function to scroll to bottom of messages
  const scrollToBottom = () => {
    // Don't auto-scroll during load more - this is critical!
    if (isLoadingMoreLocal) return;
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  // Auto-scroll when messages change (if we're at bottom)
  useEffect(() => {
    // Skip if loading more
    if (isLoadingMoreLocal) return;
    if (shouldScrollToBottom && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, shouldScrollToBottom, isLoadingMoreLocal]);
  // Reset state when chat changes
  useEffect(() => {
    if (!selectedChat) return;
    setIsLoadingMoreLocal(false);
    setShouldScrollToBottom(true);
    // Scroll to bottom after chat changes
    setTimeout(scrollToBottom, 100);
    // Focus input after a delay
    setTimeout(() => {
      if (messageInputRef.current && !isLoadingMoreLocal) {
        messageInputRef.current.focus({ preventScroll: true });
      }
    }, 150);
  }, [selectedChat, isLoadingMoreLocal]);
  // Track scroll position to determine if we're at bottom
  useEffect(() => {
    if (!chatContainerRef.current) return;

    const handleScroll = () => {
      // Don't update scroll state if we're loading more
      if (isLoadingMoreLocal) return;

      const container = chatContainerRef.current;

      if (!container) return;

      // Determine if we're at bottom (within 150px)
      const { scrollHeight, scrollTop, clientHeight } = container;

      const atBottom = scrollHeight - scrollTop - clientHeight < 150;

      setShouldScrollToBottom(atBottom);
    };

    const container = chatContainerRef.current;

    container.addEventListener('scroll', handleScroll);

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isLoadingMoreLocal]);

  /**
   * Simple load more handler with scroll position preservation
   */
  const handleLoadMore = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoadingMore || isLoadingMoreLocal || !hasMoreMessages) {
      return;
    }
    // Set local loading state
    setIsLoadingMoreLocal(true);
    // Store scroll position before loading more
    if (chatContainerRef.current) {
      scrollPositionRef.current = {
        top: chatContainerRef.current.scrollTop,
        height: chatContainerRef.current.scrollHeight,
      };
    }
    try {
      // Load more messages
      await onLoadMoreMessages();
      // Wait a bit for the DOM to update, then restore scroll position
      setTimeout(() => {
        if (chatContainerRef.current) {
          const newHeight = chatContainerRef.current.scrollHeight;

          const heightDiff = newHeight - scrollPositionRef.current.height;

          chatContainerRef.current.scrollTop =
            scrollPositionRef.current.top + heightDiff;
        }
        // Add a second delay before resetting the loading state
        // This ensures scroll position is fully restored before allowing auto-scrolling
        setTimeout(() => {
          setIsLoadingMoreLocal(false);
        }, 100);
      }, 50);
    } catch (error) {
      console.error('Error loading more messages:', error);
      setIsLoadingMoreLocal(false);
    }
  };

  /**
   * Handles sending a new message
   * @param {Event} e - Form submit event
   */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) {
      setSendError('Cannot send an empty message');

      return;
    }
    if (!isConnected) {
      setSendError('Cannot send message: You are disconnected');

      return;
    }
    setSendError(null);
    setIsSending(true);

    const messageContent = newMessage;

    setNewMessage('');
    // If not loading more, scroll to bottom when sending
    if (!isLoadingMoreLocal) {
      setShouldScrollToBottom(true);
      scrollToBottom();
    }
    try {
      const success = await onSendMessage(messageContent);

      if (!success) {
        setSendError('Failed to send message');
        setNewMessage(messageContent); // Restore message text
      }
      // Only auto-scroll if not loading more
      if (!isLoadingMoreLocal) {
        scrollToBottom();
        setTimeout(() => {
          if (messageInputRef.current) {
            messageInputRef.current.focus({ preventScroll: true });
          }
        }, 50);
      }
    } catch (error) {
      setSendError(`Error: ${error.message || 'Failed to send'}`);
      setNewMessage(messageContent); // Restore message text
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Handles Enter key press to send messages
   * @param {KeyboardEvent} e - Keyboard event
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Get current user and other participant from chat data
  const currentUser = selectedChat?.participants?.find(
    (p) => p.id.toString() === currentUserId.toString(),
  );

  const otherParticipant = selectedChat?.participants?.find(
    (p) => p.id.toString() !== currentUserId.toString(),
  );

  const chatName = selectedChat?.name || 'Επιλογή Συνομιλίας';

  const displayName = otherParticipant?.displayName;

  const chatStatus = isConnected ? 'Active' : 'Disconnected';

  const isOtherParticipantActive =
    otherParticipant?.status?.data?.attributes?.type === 'Active';

  const otherParticipantType = otherParticipant?.type?.data?.attributes?.slug;

  const isOtherParticipantFreelancer =
    otherParticipantType === 'freelancer' || otherParticipantType === 'company';

  const generatePathForOtherParticipant = () => {
    if (isOtherParticipantFreelancer && isOtherParticipantActive) {
      return `/profile/${otherParticipant?.username}`;
    }

    return null;
  };

  /**
   * Marks chat as read when input is focused
   */
  const handleInputFocus = () => {
    if (selectedChat && isConnected) {
      markChatAsRead(selectedChat.id);
    }
  };

  /**
   * Renders the load more button - only when we have more messages
   */
  const renderLoadMoreButton = () => {
    if (!hasMoreMessages || isLoading) return null;

    return (
      <div className='text-center my-3'>
        <button
          className='btn btn-sm btn-light'
          onClick={handleLoadMore}
          disabled={isLoadingMore || isLoadingMoreLocal}
        >
          {isLoadingMore || isLoadingMoreLocal ? (
            <>
              <span
                className='spinner-border spinner-border-sm mr-2'
                role='status'
                aria-hidden='true'
              ></span>
              Φόρτωση...
            </>
          ) : (
            'Φόρτωση παλαιότερων μηνυμάτων'
          )}
        </button>
      </div>
    );
  };

  return (
    <div
      id='message-container'
      className='message_container mt30-md'
      style={{ position: 'relative' }}
    >
      <div className='user_heading px-0'>
        <div className='wrap d-flex align-items-center mx30'>
          {selectedChat && (
            <div className='mr10'>
              <UserImage
                width={50}
                height={50}
                image={
                  otherParticipant?.image?.data?.attributes?.formats?.thumbnail
                    ?.url || otherParticipant?.image?.data?.attributes?.url
                }
                displayName={displayName}
                hideDisplayName={true}
                path={generatePathForOtherParticipant()}
              />
            </div>
          )}
          <div className='meta d-sm-flex justify-content-sm-between align-items-center flex-grow-1'>
            <div className='authors d-flex align-items-center justify-content-center'>
              {generatePathForOtherParticipant() ? (
                <LinkNP href={generatePathForOtherParticipant()}>
                  {displayName}
                </LinkNP>
              ) : (
                <h6 className='name mb-0'>{displayName}</h6>
              )}
              <p className='preview ml10'>{isSending && '• Αποστολή...'}</p>
            </div>
          </div>
        </div>
      </div>
      <div ref={chatContainerRef} className='inbox_chatting_box Gscrollbar'>
        {isLoading && messages.length === 0 ? (
          <ChatMessagesSkeleton />
        ) : !selectedChat ? (
          <p className='text-center p-5'>
            Επιλέξτε μια συνομιλία για να ξεκινήσετε.
          </p>
        ) : messages.length === 0 ? (
          <p className='text-center p-5'>
            Δεν υπάρχουν μηνύματα σε αυτή τη συνομιλία ακόμα.
          </p>
        ) : (
          <ul className='chatting_content'>
            {/* Load More button at original position */}
            {renderLoadMoreButton()}
            {messages
              .map((msg, index) => {
                if (!msg || !msg.id) {
                  return null;
                }

                // Ensure IDs are strings for consistent comparison
                const authorId = msg.author?.id?.toString();

                const currentUserIdStr = currentUserId?.toString();

                // Check if message is from current user
                const isSent = authorId === currentUserIdStr;

                // Get previous message to check if it's from the same author
                const prevMsg = index > 0 ? messages[index - 1] : null;

                const prevAuthorId = prevMsg?.author?.id?.toString();

                // Determine if this message is part of a sequence from the same author
                const isSequential = prevMsg && authorId === prevAuthorId;

                const authorName =
                  msg.author?.displayName ||
                  msg.author?.username ||
                  'Άγνωστος Χρήστης';

                const isOptimistic = msg.id.toString().startsWith('temp-');

                const hasError = msg.status === 'error';

                // Get Status and Type
                const authorStatus =
                  msg.author?.status?.type ||
                  msg.author?.status?.data?.attributes?.type;

                const authorType =
                  msg.author?.type?.slug ||
                  msg.author?.type?.data?.attributes?.slug;

                const isAuthorActive = authorStatus === 'Active';

                const isAuthorFreelancer =
                  authorType === 'freelancer' || authorType === 'company';

                const authorPath =
                  isAuthorActive && isAuthorFreelancer
                    ? `/profile/${msg.author?.username}`
                    : null;

                // Get the current message's date
                const messageDate = msg.createdAt
                  ? new Date(msg.createdAt)
                  : null;

                const messageDateStr = getDatePart(msg.createdAt);

                // Get previous message's date for comparison
                const prevMsgDateStr = prevMsg
                  ? getDatePart(prevMsg.createdAt)
                  : null;

                // Determine if this is the first message of a new date
                const isFirstOfDate = messageDateStr !== prevMsgDateStr;

                // Get next message's date for comparison
                const nextMsg =
                  index < messages.length - 1 ? messages[index + 1] : null;

                const nextMsgDateStr = getDatePart(nextMsg?.createdAt);

                // Determine if this is the last message of its date
                const isLastOfDate = messageDateStr !== nextMsgDateStr;

                // Format the time accordingly
                const timeAgoText = isLastOfDate
                  ? formatMessageTime(msg.createdAt)
                  : messageDate
                    ? `${messageDate.getHours()}:${messageDate
                        .getMinutes()
                        .toString()
                        .padStart(2, '0')}`
                    : '';

                // Get image paths considering various data structures
                // For msg.author.image, it's already the attributes object from chat system
                const authorImage = msg.author?.image?.url || null;

                const authorDisplayName = msg.author?.displayName || authorName;

                // Current user image path - full Strapi structure
                const currentUserImage = getImage(currentUser?.image, { size: 'avatar' });

                // Get time for the timestamp
                const messageTime = messageDate
                  ? `${messageDate.getHours()}:${messageDate
                      .getMinutes()
                      .toString()
                      .padStart(2, '0')}`
                  : '';

                // Get formatted date for the date separator line - always use full format
                const dateLineText = messageDate
                  ? (() => {
                      // Format the date part
                      const options = {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      };

                      const dateFormatter = new Intl.DateTimeFormat(
                        'el-GR',
                        options,
                      );

                      const formattedDate = dateFormatter.format(messageDate);

                      return `${formattedDate}`;
                    })()
                  : '';

                // Create a flat array that includes both date separators and messages
                const elements = [];

                // Add date separator if needed
                if (isFirstOfDate && index > 0) {
                  elements.push(
                    <li
                      key={`date-${msg.id}`}
                      className='date-separator-container'
                      style={{
                        clear: 'both',
                        float: 'none',
                        width: '100%',
                        margin: '15px 0',
                      }}
                    >
                      <div
                        className='date-separator text-center'
                        style={{
                          position: 'relative',
                          overflow: 'hidden',
                          width: '100%',
                        }}
                      >
                        <div
                          style={{
                            display: 'inline-block',
                            position: 'relative',
                            padding: '0 15px',
                            backgroundColor: '#f7f7f7',
                            borderRadius: '15px',
                            fontSize: '14px',
                            color: '#666',
                            zIndex: 1,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          }}
                        >
                          {dateLineText}
                        </div>
                        <div
                          style={{
                            position: 'absolute',
                            top: '50%',
                            width: '100%',
                            borderTop: '1px solid #e5e5e5',
                            zIndex: 0,
                          }}
                        ></div>
                      </div>
                    </li>,
                  );
                }
                // Add the message itself
                elements.push(
                  <li
                    key={msg.id}
                    className={`${
                      isSent ? 'reply float-end' : 'sent float-start'
                    } ${isOptimistic ? 'opacity-75' : ''}`}
                    data-msg-index={index}
                  >
                    {/* Only show user info if this is the first message in a sequence */}
                    {!isSequential && (
                      <div
                        className={`d-flex align-items-center mb15 mt15 ${
                          isSent ? 'justify-content-end' : ''
                        }`}
                      >
                        {!isSent && (
                          <div className='mr10 align-self-start'>
                            <UserImage
                              width={50}
                              height={50}
                              image={authorImage}
                              displayName={authorDisplayName}
                              hideDisplayName={true}
                              path={authorPath}
                            />
                          </div>
                        )}
                        <div
                          className={`title fz15 ${isSent ? 'text-end' : ''}`}
                        >
                          {isSent ? (
                            <>
                              <small className='mr10'>
                                {isOptimistic
                                  ? msg.status === 'sending'
                                    ? 'Αποστολή...'
                                    : msg.status === 'pending'
                                      ? 'Εκκρεμεί...'
                                      : 'Απέτυχε'
                                  : timeAgoText}
                              </small>{' '}
                              {/* Removed "Εγώ" while keeping the link functionality */}
                              {authorPath ? (
                                <LinkNP href={authorPath}></LinkNP>
                              ) : (
                                <></>
                              )}
                            </>
                          ) : (
                            <>
                              {authorPath ? (
                                <LinkNP href={authorPath}>
                                  {authorDisplayName}
                                </LinkNP>
                              ) : (
                                <span>{authorDisplayName}</span>
                              )}
                              <small className='ml10'>{timeAgoText}</small>{' '}
                            </>
                          )}
                        </div>
                        {isSent && (
                          <div className='ml10 align-self-end'>
                            <UserImage
                              width={50}
                              height={50}
                              image={currentUserImage}
                              displayName={currentUser?.displayName}
                              hideDisplayName={true}
                              path={authorPath}
                            />
                          </div>
                        )}
                      </div>
                    )}
                    <p
                      className={`message m0 ${
                        isSent ? 'message-sent' : 'message-received'
                      } ${hasError ? 'text-danger' : ''}`}
                    >
                      {/* Convert links in message content to clickable links */}
                      {convertLinksToAnchors(msg.content)}
                      <span className='message-time'>{messageTime}</span>
                      {hasError && (
                        <small className='d-block mt-1 text-danger'>
                          Σφάλμα: {msg.error || 'Αποτυχία αποστολής'}
                        </small>
                      )}
                    </p>
                  </li>,
                );

                return elements;
              })
              .flat()}
            <div ref={messagesEndRef} />
          </ul>
        )}
      </div>
      {sendError && (
        <div className='alert alert-danger mx-3 mb-0 mt-2 py-2'>
          {sendError.includes('Cannot send')
            ? 'Δεν είναι δυνατή η αποστολή κενού μηνύματος'
            : sendError.includes('disconnected')
              ? 'Δεν είναι δυνατή η αποστολή: Είστε αποσυνδεδεμένοι'
              : sendError.includes('Failed')
                ? 'Αποτυχία αποστολής μηνύματος'
                : sendError}
        </div>
      )}
      <div className='mi_text'>
        <div className='message_input'>
          {selectedChat ? (
            <form
              className='d-flex align-items-center'
              onSubmit={handleSendMessage}
              onClick={() => {
                // Only focus if not in loading state
                if (!isLoadingMoreLocal && messageInputRef.current) {
                  messageInputRef.current.focus({ preventScroll: true });
                }
              }}
            >
              <input
                ref={messageInputRef}
                className='form-control'
                type='text'
                placeholder={
                  isConnected
                    ? 'Μήνυμα…'
                    : 'Επανασύνδεση... Παρακαλώ περιμένετε'
                }
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  if (sendError) setSendError(null);
                }}
                onKeyPress={handleKeyPress}
                onFocus={handleInputFocus}
                disabled={!isConnected || isSending || isLoadingMoreLocal}
                autoComplete='off'
                spellCheck='false'
              />
              <button
                type='submit'
                className='btn ud-btn btn-thm'
                disabled={
                  !isConnected ||
                  !newMessage.trim() ||
                  isSending ||
                  isLoadingMoreLocal
                }
              >
                {isSending ? (
                  <>
                    Αποστολή
                    <span
                      className='spinner-border spinner-border-sm ms-2'
                      role='status'
                      aria-hidden='true'
                    ></span>
                  </>
                ) : (
                  <>
                    Αποστολή
                    <ArrowRightLong className='ms-2' />
                  </>
                )}
              </button>
            </form>
          ) : (
            <p className='text-center p-3 text-muted'>
              Επιλέξτε μια συνομιλία για να στείλετε μήνυμα.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
