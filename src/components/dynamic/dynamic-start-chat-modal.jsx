'use client';

import dynamic from 'next/dynamic';

const StartChatModal = dynamic(() => import('../modal/modal-chat-create'), {
  ssr: false,
  loading: () => null, // Modal doesn't need loading state as it's hidden by default
});

export default function StartChatModal_D(props) {
  return <StartChatModal {...props} />;
}
