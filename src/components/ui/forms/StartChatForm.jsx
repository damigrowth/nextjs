"use client";

import React, { useEffect, useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { initializeChat } from "@/lib/chat/create";

/**
 * Form component for initiating a chat conversation between users
 * @param {object} props Component properties
 * @param {string} props.fid Current user ID required for the chat payload
 * @param {string} props.freelancerId Target freelancer ID required for the chat payload
 * @returns {JSX.Element} Chat form component
 */
export default function StartChatForm({ fid, freelancerId }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialState = {
    message: null,
    error: false,
    success: false,
    chatId: null,
  };

  const [formState, formAction, isPending] = useActionState(
    initializeChat,
    initialState
  );

  /**
   * Handles redirection after successful chat creation
   */
  useEffect(() => {
    if (formState?.success && formState?.chatId) {
      setTimeout(() => {
        window.location.href = `/dashboard/messages?chat=${formState.chatId}`;
      }, 300);
    }
  }, [formState?.success, formState?.chatId, router]);

  /**
   * Prepares payload and calls the server action
   * @param {FormData} formData Form data containing the message content
   */
  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);

      const payload = {
        chat: {
          name: `Συνομιλία`,
          participants: [fid, freelancerId],
          creator: fid,
        },
        message: {
          content: formData.get("content"),
          author: fid,
        },
      };

      await formAction(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form
        action={handleSubmit}
        id={`start-chat-form-${fid}`}
        className="w-100"
      >
        <div className="mb-3">
          <textarea
            className="form-control"
            id={`content-${fid}`}
            name="content"
            rows="6"
            placeholder="Πληκτρολόγησε εδώ το μήνυμα…"
            required
            disabled={isSubmitting || isPending}
          ></textarea>
        </div>
        {formState?.message && !formState.success && (
          <div
            className={`alert ${
              formState.error ? "alert-danger" : "alert-warning"
            } mb-3`}
          >
            {formState.message}
          </div>
        )}
        {formState?.success && formState.message && (
          <div className="alert alert-success mb-3">
            {formState.message} Redirecting...
          </div>
        )}
        <div className="text-end pt10">
          <button
            type="submit"
            className="ud-btn btn-thm"
            disabled={isSubmitting || isPending}
          >
            {isSubmitting || isPending ? (
              <>
                <span>Αποστολή</span>
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
        </div>
      </form>
    </>
  );
}
