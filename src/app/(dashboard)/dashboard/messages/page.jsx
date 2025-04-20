import MessageInfo from "@/components/dashboard/section/MessageInfo";
import { getFreelancerId } from "@/lib/users/freelancer";
import { getData } from "@/lib/client/operations";
import { GET_FREELANCER_CHATS } from "@/lib/graphql/queries/main/chat";

export const metadata = {
  title: "Μηνύματα | Doulitsa",
};

export default async function MessagesPage() {
  const fid = await getFreelancerId();
  let initialChatList = [];
  let chatListError = null;

  try {
    if (!fid) {
      chatListError = "Freelancer profile not found";
    } else {
      const data = await getData(
        GET_FREELANCER_CHATS,
        { freelancerId: fid },
        "FREELANCER_CHATS",
        [`freelancer:${fid}`]
      );

      if (data?.chats?.data) {
        initialChatList = data.chats.data.map((chat) => ({
          id: chat.id,
          ...chat.attributes,
          lastMessage: chat.attributes.lastMessage?.data?.attributes || null,
          hasNewMessage: (chat.attributes.unreadCountMap?.[fid] || 0) > 0,
          unreadCount: chat.attributes.unreadCountMap?.[fid] || 0,
          participants:
            chat.attributes.participants?.data?.map((p) => ({
              id: p.id,
              ...p.attributes,
            })) || [],
        }));
      }
    }
  } catch (error) {
    chatListError = error.message || "Failed to load page data";
  }

  return (
    <MessageInfo
      initialChatList={initialChatList}
      chatListError={chatListError}
      currentFreelancerId={fid}
    />
  );
}
