import { formatCompactMessageTime } from "@/utils/timeAgo";
import UserImage from "@/components/user/UserImage";

export default function UserChatList1({ data, currentFreelancerId }) {
  const otherParticipant = data.participants?.find(
    (p) => p.id !== currentFreelancerId
  );

  const displayName =
    otherParticipant?.displayName ||
    (otherParticipant
      ? `${otherParticipant.firstName || ""} ${
          otherParticipant.lastName || ""
        }`.trim()
      : data.name);

  // Truncate message text to a reasonable length
  const truncateMessage = (text, maxLength = 40) => {
    if (!text) return "No messages yet";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  return (
    <div className="d-flex align-items-center position-relative">
      <div className="mr10">
        <UserImage
          width={50}
          height={50}
          image={otherParticipant?.image?.data?.attributes?.url}
          firstName={otherParticipant?.firstName}
          lastName={otherParticipant?.lastName}
          displayName={displayName}
          hideDisplayName={true}
        />
      </div>
      <div className="d-flex flex-grow-1">
        <div className="d-inline-block text-truncate">
          <div className="user-chat-list-item-name fz15 fw500 dark-color ff-heading mb-0 text-truncate">
            {displayName}
            {data.unreadCount > 0 && (
              <div className="user-chat-list-item-unread bg-danger d-flex align-items-center justify-content-center">
                <span className="text-white">{data.unreadCount}</span>
              </div>
            )}
          </div>

          <p
            className={`preview mb-0 text-truncate ${
              data.unreadCount > 0 ? "fw600" : ""
            }`}
          >
            {truncateMessage(data.lastMessage?.content)}
          </p>
        </div>
        <div className="iul_notific ms-auto text-end">
          <small>
            {formatCompactMessageTime(
              data.lastMessage?.createdAt || data.updatedAt
            )}
          </small>
        </div>
      </div>
    </div>
  );
}
