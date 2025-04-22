import MessageInfo from "@/components/dashboard/section/MessageInfo";
import { getFreelancerId } from "@/lib/users/freelancer";
import { getData } from "@/lib/client/operations";
import { GET_FREELANCER_CHATS } from "@/lib/graphql/queries/main/chat";

export const metadata = {
  title: "Μηνύματα | Doulitsa",
};

/**
 * Messages page component that fetches initial chat data for the current freelancer
 * @returns {JSX.Element} Rendered message interface with chat data
 */
export default async function MessagesPage() {
  const fid = await getFreelancerId();
  let initialChatList = [];
  let chatListError = null;

  try {
    if (!fid) {
      chatListError = "Δεν βρέθηκε προφίλ freelancer";
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
    chatListError = error.message || "Αποτυχία φόρτωσης δεδομένων σελίδας";
  }

  return (
    <MessageInfo
      initialChatList={initialChatList}
      chatListError={chatListError}
      currentFreelancerId={fid}
    />
  );
}
