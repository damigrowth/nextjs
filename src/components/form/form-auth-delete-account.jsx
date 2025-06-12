'use client';

import { useActionState, useEffect, useRef, useState } from 'react';

import { DeleteModal } from '@/components/modal';
import { deleteAccount } from '@/actions/auth/account';
import { IconCheckCircle, IconCheck } from '@/components/icon/fa';

export default function DeleteAccountForm({ username }) {
  const formRef = useRef(null);

  const [confirmUsername, setConfirmUsername] = useState('');

  const isConfirmMatch = confirmUsername === username;

  // For deleting account
  const [deleteState, deleteAction, isDeletePending] = useActionState(
    deleteAccount,
    {
      message: null,
      error: false,
    },
  );

  // Reset form when modal is hidden
  useEffect(() => {
    const resetForm = () => {
      setConfirmUsername('');
      formRef?.current?.reset();
    };

    // Add event listener for modal hidden event
    const modalElement = document.getElementById('deleteAccountModal');

    if (modalElement) {
      modalElement.addEventListener('hidden.bs.modal', resetForm);
    }

    // Cleanup event listener on component unmount
    return () => {
      if (modalElement) {
        modalElement.removeEventListener('hidden.bs.modal', resetForm);
      }
    };
  }, []);
  useEffect(() => {
    if (deleteState?.success) {
      // Clear client-side storage immediately
      localStorage.clear();
      sessionStorage.clear();
      // Short delay to show success message, then hard redirect
      setTimeout(() => {
        window.location.href = deleteState.redirectUrl || '/';
      }, 2000);
    }
  }, [deleteState?.success]);

  const handleFormAction = (formData) => {
    // Add username to the form data
    formData.append('username', username);

    return deleteAction(formData);
  };

  return (
    <>
      <button
        type='button'
        className='btn-none mt100'
        data-bs-toggle='modal'
        data-bs-target='#deleteAccountModal'
      >
        Διαγραφή Λογαριασμού
      </button>
      <DeleteModal
        id='deleteAccountModal'
        title={
          <>
            ⚠️ Προσοχή! <br /> <br />
            Είστε σίγουροι ότι θέλετε να διαγράψετε τον λογαριασμό και όλα τα
            δεδομένα σας;
          </>
        }
        description={
          <>
            Η διαγραφή του λογαριασμού είναι{' '}
            <strong>μη αναστρέψιμη ενέργεια.</strong> <br />
            Πληκτρολογήστε το username σας ({username}) για επιβεβαίωση:
          </>
        }
        disableConfirm={!isConfirmMatch}
        isLoading={isDeletePending}
        onConfirm={() => formRef.current?.requestSubmit()}
        hideBody={deleteState?.success}
        hideButtons={deleteState?.success}
      >
        {deleteState?.success && (
          <div className='modal-body text-center p-5'>
            <IconCheckCircle className='text-thm2' size='3x' />
            <h4 className='mt-3'>Ο λογαριασμός σας διαγράφηκε με επιτυχία</h4>
            <p className='mb-4'>Ανακατεύθυνση στην αρχική σελίδα...</p>
            <div className='spinner-border text-thm' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
          </div>
        )}
        {!deleteState?.success && (
          <form
            ref={formRef}
            action={handleFormAction}
            className='mt-2 mb30 col-sm-8'
          >
            <input
              type='text'
              className='form-control'
              id='confirm-username'
              name='confirm-username'
              value={confirmUsername}
              onChange={(e) => setConfirmUsername(e.target.value)}
              placeholder={username}
              required
            />
            {confirmUsername && !isConfirmMatch && (
              <div className='text-danger small mt-1'>
                Το username δεν ταιριάζει
              </div>
            )}
            {isConfirmMatch && (
              <div className='text-success small mt-1'>
                <IconCheck className='me-1' /> Το username επιβεβαιώθηκε
              </div>
            )}
          </form>
        )}
        {deleteState?.message && deleteState?.error && (
          <div className='col-12'>
            <div className='alert alert-danger'>{deleteState?.message}</div>
          </div>
        )}
      </DeleteModal>
    </>
  );
}
