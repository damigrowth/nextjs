import { useState, useEffect, useRef } from "react";
import { timeAgo, formatMessageTime, getDatePart } from "@/utils/timeAgo";
import UserImage from "@/components/user/UserImage";

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

  // Scroll to bottom function
  const scrollChatToBottom = () => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  };

  // Focus input function
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

  // Scroll to bottom when messages change
  useEffect(() => {
    if (shouldScrollToBottom) {
      setTimeout(scrollChatToBottom, 100);
    }
  }, [messages, shouldScrollToBottom]);

  // Focus input when chat changes
  useEffect(() => {
    if (selectedChat) {
      setShouldScrollToBottom(true);
      focusMessageInput();
    }
  }, [selectedChat]);

  // Focus input after messages load
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      setShouldScrollToBottom(true);
      focusMessageInput();
    }
  }, [isLoading, messages.length]);

  // Set up scroll detection
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

  // Handle message submission
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

    try {
      const success = await onSendMessage(messageContent);

      if (!success) {
        setSendError("Failed to send message");
        setNewMessage(messageContent); // Restore message text
      }

      setShouldScrollToBottom(true);
      focusMessageInput();
    } catch (error) {
      setSendError(`Error: ${error.message || "Failed to send"}`);
      setNewMessage(messageContent); // Restore message text
    } finally {
      setIsSending(false);
    }
  };

  // Handle Enter key press
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

  const chatName = selectedChat?.name || "Select a Conversation";
  const displayName =
    otherParticipant?.displayName ||
    (otherParticipant
      ? `${otherParticipant.firstName || ""} ${
          otherParticipant.lastName || ""
        }`.trim()
      : chatName);
  const chatStatus = isConnected ? "Active" : "Disconnected";

  const handleInputFocus = () => {
    if (selectedChat && isConnected) {
      markChatAsRead(selectedChat.id);
    }
  };

  return (
    <div className="message_container mt30-md">
      <div className="user_heading px-0 mx30">
        <div className="wrap d-flex align-items-center">
          {selectedChat && (
            <div className="mr10">
              <UserImage
                width={50}
                height={50}
                image={
                  otherParticipant?.image?.data?.attributes?.formats?.thumbnail
                    ?.url || otherParticipant?.image?.data?.attributes?.url
                }
                firstName={otherParticipant?.firstName}
                lastName={otherParticipant?.lastName}
                displayName={displayName}
                hideDisplayName={true}
              />
            </div>
          )}
          <div className="meta d-sm-flex justify-content-sm-between align-items-center flex-grow-1">
            <div className="authors">
              <h6 className="name mb-0">{displayName}</h6>
              <p className="preview">
                {chatStatus} {isSending && "• Sending..."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={chatContainerRef}
        className="inbox_chatting_box Gscrollbar"
        style={{
          minHeight: "400px",
          maxHeight: "60vh",
          overflowY: "auto",
          paddingBottom: "100px", // Add extra padding at the bottom
        }}
      >
        {isLoading ? (
          <div className="text-center p-5">
            <div className="spinner-border text-thm2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading messages...</p>
          </div>
        ) : !selectedChat ? (
          <p className="text-center p-5">
            Select a conversation to start messaging.
          </p>
        ) : messages.length === 0 ? (
          <p className="text-center p-5">
            No messages in this conversation yet.
          </p>
        ) : (
          <ul className="chatting_content">
            {messages.map((msg, index) => {
              if (!msg || !msg.id) {
                return null;
              }

              // Ensure IDs are strings for consistent comparison
              const authorId = msg.author?.id?.toString();
              const currentUserIdStr = currentUserId?.toString();

              // Check if message is from current user
              const isSent = authorId === currentUserIdStr;

              const authorName =
                msg.author?.displayName ||
                msg.author?.username ||
                "Unknown User";
              const isOptimistic = msg.id.toString().startsWith("temp-");
              const hasError = msg.status === "error";

              // Get the current message's date
              const messageDate = msg.createdAt
                ? new Date(msg.createdAt)
                : null;
              const messageDateStr = getDatePart(msg.createdAt);

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

              const authorFirstName = msg.author?.firstName;
              const authorLastName = msg.author?.lastName;
              const authorDisplayName = msg.author?.displayName || authorName;

              // Current user image path
              const currentUserImage =
                currentUser?.image?.data?.attributes?.formats?.thumbnail?.url ||
                currentUser?.image?.data?.attributes?.url;

              return (
                <li
                  key={msg.id}
                  className={`${
                    isSent ? "reply float-end" : "sent float-start"
                  } ${isOptimistic ? "opacity-75" : ""}`}
                  data-msg-index={index}
                >
                  <div
                    className={`d-flex align-items-center mb15 ${
                      isSent ? "justify-content-end" : ""
                    }`}
                  >
                    {!isSent && (
                      <div className="mr10 align-self-start">
                        <UserImage
                          width={50}
                          height={50}
                          image={authorImage}
                          firstName={authorFirstName}
                          lastName={authorLastName}
                          displayName={authorDisplayName}
                          hideDisplayName={true}
                        />
                      </div>
                    )}
                    <div className={`title fz15 ${isSent ? "text-end" : ""}`}>
                      {isSent ? (
                        <>
                          <small className="mr10">
                            {isOptimistic
                              ? msg.status === "sending"
                                ? "Sending..."
                                : msg.status === "pending"
                                ? "Pending..."
                                : "Failed"
                              : timeAgoText}
                          </small>{" "}
                          {authorDisplayName}{" "}
                        </>
                      ) : (
                        <>
                          {authorDisplayName}{" "}
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
                          firstName={currentUser?.firstName}
                          lastName={currentUser?.lastName}
                          displayName={currentUser?.displayName}
                          hideDisplayName={true}
                        />
                      </div>
                    )}
                  </div>
                  <p
                    className={`fit ${
                      isSent ? "message-sent" : "message-received"
                    } ${hasError ? "text-danger" : ""}`}
                  >
                    {msg.content}
                    {hasError && (
                      <small className="d-block mt-1 text-danger">
                        Error: {msg.error || "Failed to send"}
                      </small>
                    )}
                  </p>
                </li>
              );
            })}
            <div ref={messagesEndRef} />
          </ul>
        )}
      </div>

      {sendError && (
        <div className="alert alert-danger mx-3 mb-0 mt-2 py-2">
          {sendError}
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
                  isConnected ? "Type a message" : "Reconnecting... Please wait"
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
                    Send
                    <span
                      className="spinner-border spinner-border-sm ms-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  </>
                ) : (
                  <>
                    Send
                    <i className="fal fa-arrow-right-long ms-2" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <p className="text-center p-3 text-muted">
              Select a conversation to send a message.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
