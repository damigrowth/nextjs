'use client';

import React, { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import { initializeChat } from '@/actions/tenant/chat';
import { ArrowRightLong } from '@/components/icon/fa';

/**
 * Form component for initiating a chat conversation between users
 * @param {Object} props - Component properties
 * @param {string|number} props.fid - Current user ID required for the chat payload
 * @param {string|number} props.freelancerId - Target freelancer ID required for the chat payload
 * @param {string} [props.title] - Optional  title to include in the predefined message
 * @returns {JSX.Element} Chat initiation form component
 */
export default function StartChatForm({ fid, freelancerId, title }) {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [socket, setSocket] = useState(null);

  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const [messageContent, setMessageContent] = useState(title ? title : '');

  const initialState = {
    message: null,
    error: false,
    success: false,
    chatId: null,
  };

  const [formState, formAction, isPending] = useActionState(
    initializeChat,
    initialState,
  );

  /**
   * Updates the message content when title changes
   */
  useEffect(() => {
    if (title) {
      setMessageContent(title);
    }
  }, [title]);
  /**
   * Initializes socket connection for real-time chat functionality
   */
  useEffect(() => {
    if (!fid) return;

    const serverUrl = 'https://api.doulitsa.gr';

    const newSocket = io(serverUrl, {
      query: { freelancerId: fid },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    newSocket.on('connect', () => {
      setIsSocketConnected(true);
    });
    newSocket.on('disconnect', () => {
      setIsSocketConnected(false);
    });
    setSocket(newSocket);

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [fid]);
  /**
   * Handles redirection after successful chat creation and notifies the recipient
   */
  useEffect(() => {
    if (formState?.success && formState?.chatId) {
      // If socket is connected, emit a new_chat event to the recipient
      if (socket && isSocketConnected) {
        // Prepare chat data for the event
        const chatData = {
          id: formState.chatId.toString(),
          name: `Chat${formState.chatId}`, // Use the same name from the chat creation
          isGroup: false,
          updatedAt: new Date().toISOString(),
          unreadCountMap: {
            [fid.toString()]: 0,
            [freelancerId.toString()]: 1,
          },
          participants: [
            {
              id: fid.toString(),
            },
            {
              id: freelancerId.toString(),
            },
          ],
        };

        // Emit a custom direct event with the recipient ID
        socket.emit('new_chat_direct', {
          recipientId: freelancerId.toString(),
          chatData,
        });
        // Wait briefly to ensure the event is processed
        setTimeout(() => {
          router.push(`/dashboard/messages?chat=${formState.chatId}`);
        }, 500);
      } else {
        // If socket isn't connected, just redirect
        router.push(`/dashboard/messages?chat=${formState.chatId}`);
      }
    }
  }, [
    formState?.success,
    formState?.chatId,
    router,
    socket,
    isSocketConnected,
    freelancerId,
    fid,
  ]);

  /**
   * Prepares payload and calls the server action to create a new chat
   * @param {FormData} formData - Form data containing the message content
   */
  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);

      // Create the chat payload
      const payload = {
        chat: {
          participants: [fid, freelancerId],
          creator: fid,
        },
        message: {
          content: messageContent,
          author: fid,
        },
      };

      await formAction(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles textarea content changes
   * @param {Event} e - The change event
   */
  const handleContentChange = (e) => {
    setMessageContent(e.target.value);
  };

  return (
    <>
      <form
        action={handleSubmit}
        id={`start-chat-form-${fid}`}
        className='w-100'
      >
        <div className='mb-3'>
          <textarea
            className='form-control'
            id={`content-${fid}`}
            name='content'
            rows='7'
            placeholder='Πληκτρολόγησε εδώ το μήνυμα…'
            required
            disabled={isSubmitting || isPending}
            value={messageContent}
            onChange={handleContentChange}
            style={{
              minHeight: '100px',
            }}
          ></textarea>
        </div>
        {formState?.message && !formState.success && (
          <div
            className={`alert ${formState.error ? 'alert-danger' : 'alert-warning'} mb-3`}
          >
            {formState.message === 'Missing required information'
              ? 'Λείπουν απαραίτητες πληροφορίες'
              : formState.message === 'Authentication required'
                ? 'Απαιτείται σύνδεση'
                : formState.message === 'Failed to start chat'
                  ? 'Αποτυχία έναρξης συνομιλίας'
                  : formState.message}
          </div>
        )}
        {formState?.success && formState.message && (
          <div className='alert alert-success mb-3'>
            {formState.message === 'Chat started successfully!'
              ? 'Η συνομιλία ξεκίνησε με επιτυχία!'
              : formState.message}{' '}
            Ανακατεύθυνση...
          </div>
        )}
        <div className='text-end pt10'>
          <button
            type='submit'
            className='ud-btn btn-thm'
            disabled={isSubmitting || isPending}
          >
            {isSubmitting || isPending ? (
              <>
                <span>Αποστολή</span>
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
        </div>
      </form>
    </>
  );
}
