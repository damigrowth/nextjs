import { formatMessageTime } from "@/utils/timeAgo";
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
      <div className="d-sm-flex flex-grow-1">
        <div className="d-inline-block text-truncate">
          <div className="fz15 fw500 dark-color ff-heading mb-0 text-truncate">
            {displayName}
          </div>
          <p
            className={`preview mb-0 text-truncate ${
              data.unreadCount > 0 ? "fw600" : ""
            }`}
          >
            {data.lastMessage?.content || "No messages yet"}
          </p>
        </div>
        <div className="iul_notific ms-auto text-end">
          <small>
            {formatMessageTime(data.lastMessage?.createdAt || data.updatedAt)}
          </small>
          {data.unreadCount > 0 && (
            <div
              className="m_notif bg-danger d-flex align-items-center justify-content-center"
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                fontSize: "11px",
                marginLeft: "auto",
                marginTop: "4px",
              }}
            >
              <span className="text-white">{data.unreadCount}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
