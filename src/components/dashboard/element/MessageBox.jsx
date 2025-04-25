import { useState, useEffect, useRef } from "react";
import {
  timeAgo,
  formatMessageTime,
  getDatePart,
  formatCompactMessageTime,
} from "@/utils/timeAgo";
import UserImage from "@/components/user/UserImage";
import ChatMessagesSkeleton from "@/components/ui/Skeletons/ChatMessagesSkeleton";
import Link from "next/link";

/**
 * Converts URLs in text to clickable links that open in a new tab
 * @param {string} text - Text that may contain URLs
 * @returns {Array} Array of text and link elements
 */
const convertLinksToAnchors = (text) => {
  if (!text) return "";

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
        target="_blank"
        rel="noopener noreferrer"
        className="text-thm"
      >
        {match[0]}
      </a>
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
 * @param {Function} props.onSendMessage - Callback to send a message
 * @param {Function} props.markChatAsRead - Callback to mark a chat as read
 * @returns {JSX.Element} Rendered message box component
 */
export default function MessageBox({
  selectedChat,
  messages,
  isConnected,
  currentUserId,
  isLoading,
  onSendMessage,
  markChatAsRead,
}) {
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const wasEnterKeySend = useRef(false);

  /**
   * Scrolls the chat container to the bottom
   * with improved reliability
   */
  const scrollChatToBottom = () => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;

      // Using requestAnimationFrame ensures the browser has painted the DOM
      // before we attempt to scroll
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;

        // Double-check scroll position after a short delay to ensure it worked
        setTimeout(() => {
          if (
            container.scrollTop + container.clientHeight <
            container.scrollHeight - 20
          ) {
            container.scrollTop = container.scrollHeight;
          }
        }, 50);
      });
    }
  };

  /**
   * Focuses the message input field
   */
  const focusMessageInput = () => {
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    } else {
      // Try again with delays if not ready
      setTimeout(() => {
        if (messageInputRef.current) messageInputRef.current.focus();
      }, 100);
    }
  };

  /**
   * Scrolls to bottom when messages change if shouldScrollToBottom is true
   */
  useEffect(() => {
    if (shouldScrollToBottom && messages.length > 0) {
      // Immediate scroll attempt
      scrollChatToBottom();

      // Additional scroll attempts with increasing delays
      setTimeout(scrollChatToBottom, 100);
      setTimeout(scrollChatToBottom, 300);
    }
  }, [messages, shouldScrollToBottom]);

  /**
   * Focuses input and scrolls to bottom when chat changes
   */
  useEffect(() => {
    if (selectedChat) {
      setShouldScrollToBottom(true);
      focusMessageInput();
    }
  }, [selectedChat]);

  /**
   * Focuses input after messages load
   */
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      setShouldScrollToBottom(true);
      focusMessageInput();
    }
  }, [isLoading, messages.length]);

  /**
   * Sets up scroll detection to determine if we should auto-scroll
   */
  useEffect(() => {
    const handleScroll = () => {
      if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } =
          chatContainerRef.current;
        // Consider "at bottom" if within 100px of bottom
        const atBottom =
          Math.abs(scrollHeight - scrollTop - clientHeight) < 100;
        setShouldScrollToBottom(atBottom);
      }
    };

    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  /**
   * Handles sending a new message
   * @param {Event} e - Form submit event
   */
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) {
      setSendError("Cannot send an empty message");
      return;
    }

    if (!isConnected) {
      setSendError("Cannot send message: You are disconnected");
      return;
    }

    setSendError(null);
    setIsSending(true);
    const messageContent = newMessage;
    setNewMessage("");

    // Force scroll to bottom immediately when sending
    setShouldScrollToBottom(true);
    scrollChatToBottom();

    try {
      const success = await onSendMessage(messageContent);

      if (!success) {
        setSendError("Failed to send message");
        setNewMessage(messageContent); // Restore message text
      }

      // Additional scroll after message is sent
      scrollChatToBottom();

      // Use a small delay to ensure the input is focused after state updates
      setTimeout(() => {
        focusMessageInput();
        scrollChatToBottom(); // One more scroll for good measure
      }, 50);
    } catch (error) {
      setSendError(`Error: ${error.message || "Failed to send"}`);
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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      wasEnterKeySend.current = true;
      handleSendMessage(e);
    }
  };

  // Get current user and other participant from chat data
  const currentUser = selectedChat?.participants?.find(
    (p) => p.id.toString() === currentUserId.toString()
  );

  const otherParticipant = selectedChat?.participants?.find(
    (p) => p.id.toString() !== currentUserId.toString()
  );

  const chatName = selectedChat?.name || "Επιλογή Συνομιλίας";
  const displayName = otherParticipant?.displayName;
  const chatStatus = isConnected ? "Active" : "Disconnected";

  const isOtherParticipantActive =
    otherParticipant?.status?.data?.attributes?.type === "Active";

  const isOtherParticipantFreelancer =
    otherParticipant?.type?.data?.attributes?.slug === "freelancer";

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

  return (
    <div className="message_container mt30-md">
      <div className="user_heading px-0">
        <div className="wrap d-flex align-items-center mx30">
          {selectedChat && (
            <div className="mr10">
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
          <div className="meta d-sm-flex justify-content-sm-between align-items-center flex-grow-1">
            <div className="authors d-flex align-items-center justify-content-center">
              {generatePathForOtherParticipant() ? (
                <Link href={generatePathForOtherParticipant()}>
                  {displayName}
                </Link>
              ) : (
                <h6 className="name mb-0">{displayName}</h6>
              )}

              <p className="preview ml10">
                {/* {chatStatus === "Active" ? "Ενεργός" : "Αποσυνδεδημένος"}{" "} */}
                {isSending && "• Αποστολή..."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={chatContainerRef}
        className="inbox_chatting_box Gscrollbar"
        style={
          {
            // minHeight: "400px",
            // maxHeight: "60vh",
            // overflowY: "auto",
            // paddingBottom: "100px", // Add extra padding at the bottom
          }
        }
      >
        {isLoading ? (
          <ChatMessagesSkeleton />
        ) : !selectedChat ? (
          <p className="text-center p-5">
            Επιλέξτε μια συνομιλία για να ξεκινήσετε.
          </p>
        ) : messages.length === 0 ? (
          <p className="text-center p-5">
            Δεν υπάρχουν μηνύματα σε αυτή τη συνομιλία ακόμα.
          </p>
        ) : (
          <ul className="chatting_content">
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
                  "Άγνωστος Χρήστης";
                const isOptimistic = msg.id.toString().startsWith("temp-");
                const hasError = msg.status === "error";

                // Get Status and Type
                const authorStatus =
                  msg.author?.status?.type ||
                  msg.author?.status?.data?.attributes?.type;

                const authorType =
                  msg.author?.type?.slug ||
                  msg.author?.type?.data?.attributes?.slug;

                const isAuthorActive = authorStatus === "Active";
                const isAuthorFreelancer = authorType === "freelancer";

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
                      .padStart(2, "0")}`
                  : "";

                // Get image paths considering various data structures
                const authorImage =
                  msg.author?.image?.formats?.thumbnail?.url ||
                  msg.author?.image?.url;

                const authorDisplayName = msg.author?.displayName || authorName;

                // Current user image path
                const currentUserImage =
                  currentUser?.image?.data?.attributes?.formats?.thumbnail
                    ?.url || currentUser?.image?.data?.attributes?.url;

                // Get time for the timestamp
                const messageTime = messageDate
                  ? `${messageDate.getHours()}:${messageDate
                      .getMinutes()
                      .toString()
                      .padStart(2, "0")}`
                  : "";

                // Get formatted date for the date separator line - always use full format
                const dateLineText = messageDate
                  ? (() => {
                      // Format the date part
                      const options = {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      };
                      const dateFormatter = new Intl.DateTimeFormat(
                        "el-GR",
                        options
                      );
                      const formattedDate = dateFormatter.format(messageDate);

                      // // Format the time part
                      // const hours = messageDate.getHours();
                      // const minutes = messageDate
                      //   .getMinutes()
                      //   .toString()
                      //   .padStart(2, "0");
                      // const timeStr = `${hours}:${minutes}`;

                      // Combine them in the consistent format
                      return `${formattedDate}`;
                    })()
                  : "";

                // Create a flat array that includes both date separators and messages
                const elements = [];

                // Add date separator if needed
                if (isFirstOfDate && index > 0) {
                  elements.push(
                    <li
                      key={`date-${msg.id}`}
                      className="date-separator-container"
                      style={{
                        clear: "both",
                        float: "none",
                        width: "100%",
                        margin: "15px 0",
                      }}
                    >
                      <div
                        className="date-separator text-center"
                        style={{
                          position: "relative",
                          overflow: "hidden",
                          width: "100%",
                        }}
                      >
                        <div
                          style={{
                            display: "inline-block",
                            position: "relative",
                            padding: "0 15px",
                            backgroundColor: "#f7f7f7",
                            borderRadius: "15px",
                            fontSize: "14px",
                            color: "#666",
                            zIndex: 1,
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          }}
                        >
                          {dateLineText}
                        </div>
                        <div
                          style={{
                            position: "absolute",
                            top: "50%",
                            width: "100%",
                            borderTop: "1px solid #e5e5e5",
                            zIndex: 0,
                          }}
                        ></div>
                      </div>
                    </li>
                  );
                }

                // Add the message itself
                elements.push(
                  <li
                    key={msg.id}
                    className={`${
                      isSent ? "reply float-end" : "sent float-start"
                    } ${isOptimistic ? "opacity-75" : ""}`}
                    data-msg-index={index}
                  >
                    {/* Only show user info if this is the first message in a sequence */}
                    {!isSequential && (
                      <div
                        className={`d-flex align-items-center mb15 mt15 ${
                          isSent ? "justify-content-end" : ""
                        }`}
                      >
                        {!isSent && (
                          <div className="mr10 align-self-start">
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
                          className={`title fz15 ${isSent ? "text-end" : ""}`}
                        >
                          {isSent ? (
                            <>
                              <small className="mr10">
                                {isOptimistic
                                  ? msg.status === "sending"
                                    ? "Αποστολή..."
                                    : msg.status === "pending"
                                    ? "Εκκρεμεί..."
                                    : "Απέτυχε"
                                  : timeAgoText}
                              </small>{" "}
                              {/* Removed "Εγώ" while keeping the link functionality */}
                              {authorPath ? (
                                <Link href={authorPath}></Link>
                              ) : (
                                <></>
                              )}
                            </>
                          ) : (
                            <>
                              {authorPath ? (
                                <Link href={authorPath}>
                                  {authorDisplayName}
                                </Link>
                              ) : (
                                <span>{authorDisplayName}</span>
                              )}
                              <small className="ml10">{timeAgoText}</small>{" "}
                            </>
                          )}
                        </div>
                        {isSent && (
                          <div className="ml10 align-self-end">
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
                        isSent ? "message-sent" : "message-received"
                      } ${hasError ? "text-danger" : ""}`}
                    >
                      {/* Convert links in message content to clickable links */}
                      {convertLinksToAnchors(msg.content)}
                      <span className="message-time">{messageTime}</span>
                      {hasError && (
                        <small className="d-block mt-1 text-danger">
                          Σφάλμα: {msg.error || "Αποτυχία αποστολής"}
                        </small>
                      )}
                    </p>
                  </li>
                );

                return elements;
              })
              .flat()}
            <div ref={messagesEndRef} />
          </ul>
        )}
      </div>

      {sendError && (
        <div className="alert alert-danger mx-3 mb-0 mt-2 py-2">
          {sendError.includes("Cannot send")
            ? "Δεν είναι δυνατή η αποστολή κενού μηνύματος"
            : sendError.includes("disconnected")
            ? "Δεν είναι δυνατή η αποστολή: Είστε αποσυνδεδεμένοι"
            : sendError.includes("Failed")
            ? "Αποτυχία αποστολής μηνύματος"
            : sendError}
        </div>
      )}

      <div className="mi_text">
        <div className="message_input">
          {selectedChat ? (
            <form
              className="d-flex align-items-center"
              onSubmit={handleSendMessage}
              onClick={focusMessageInput}
            >
              <input
                ref={messageInputRef}
                className="form-control"
                type="text"
                placeholder={
                  isConnected
                    ? "Μήνυμα…"
                    : "Επανασύνδεση... Παρακαλώ περιμένετε"
                }
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  if (sendError) setSendError(null);
                }}
                onKeyPress={handleKeyPress}
                onFocus={handleInputFocus}
                disabled={!isConnected || isSending}
                autoComplete="off"
                spellCheck="false"
              />
              <button
                type="submit"
                className="btn ud-btn btn-thm"
                disabled={!isConnected || !newMessage.trim() || isSending}
              >
                {isSending ? (
                  <>
                    Αποστολή
                    <span
                      className="spinner-border spinner-border-sm ms-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  </>
                ) : (
                  <>
                    Αποστολή
                    <i className="fal fa-arrow-right-long ms-2" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <p className="text-center p-3 text-muted">
              Επιλέξτε μια συνομιλία για να στείλετε μήνυμα.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
