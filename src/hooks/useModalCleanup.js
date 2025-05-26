import { useEffect, useRef } from 'react';

/**
 * Custom hook to handle modal cleanup and accessibility
 *
 * @param {string} modalId - The ID of the modal element
 * @returns {Object} - Object containing helper functions and refs
 */
export default function useModalCleanup(modalId) {
  const previousFocusRef = useRef(null);

  // Function to clean up modal effects
  const cleanupModal = () => {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';

    const modalBackdrop = document.querySelector('.modal-backdrop');

    if (modalBackdrop) {
      modalBackdrop.remove();
    }
  };

  // Handle link clicks inside the modal
  const handleLinkClick = () => {
    const modalElement = document.getElementById(modalId);

    if (modalElement && typeof window !== 'undefined' && window.bootstrap) {
      const bsModal = window.bootstrap.Modal.getInstance(modalElement);

      if (bsModal) {
        bsModal.hide();
      }
    }
    cleanupModal();
  };

  useEffect(() => {
    const modalElement = document.getElementById(modalId);

    const handleModalShow = () => {
      // Store the element that had focus before opening the modal
      previousFocusRef.current = document.activeElement;
    };

    const handleModalHidden = () => {
      // Reset body styles when modal is hidden
      cleanupModal();
      // Restore focus to the previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
      // Remove aria-hidden when modal is closed
      if (modalElement) {
        modalElement.removeAttribute('aria-hidden');
      }
    };

    if (modalElement) {
      modalElement.addEventListener('show.bs.modal', handleModalShow);
      modalElement.addEventListener('hidden.bs.modal', handleModalHidden);

      return () => {
        modalElement.removeEventListener('show.bs.modal', handleModalShow);
        modalElement.removeEventListener('hidden.bs.modal', handleModalHidden);
      };
    }
  }, [modalId]);
  // Cleanup on page navigation
  useEffect(() => {
    return () => {
      // Clean up when component unmounts (page navigation)
      cleanupModal();
    };
  }, []);

  return {
    handleLinkClick,
    cleanupModal,
  };
}
