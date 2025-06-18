'use client';

import LinkNP from '@/components/link';

import useModalCleanup from '@/hooks/useModalCleanup';

import StartChatForm from '../form/form-start-chat';

/**
 * Modal component that contains the form for starting a new chat with a freelancer
 * @param {Object} props - Component props
 * @param {string|number} props.fid - ID of the current user
 * @param {string|number} props.freelancerId - ID of the target freelancer to chat with
 * @param {string} props.displayName - Display name of the target freelancer
 * @param {string} [props.title] - Optional  title to include in the predefined message
 * @returns {JSX.Element} Modal containing a chat form
 */
export default function StartChatModal({
  fid,
  freelancerId,
  displayName,
  title,
}) {
  const { handleLinkClick } = useModalCleanup('startChatModal');

  return (
    <div
      className='modal fade'
      id='startChatModal'
      tabIndex={-1}
      aria-labelledby='startChatModalLabel'
    >
      <div className='modal-dialog modal-dialog-centered'>
        <div className='modal-content position-relative'>
          <button
            type='button'
            className='btn-close position-absolute no-rotate btn-raw'
            data-bs-dismiss='modal'
            aria-label='Κλείσιμο'
            style={{ top: '10px', right: '10px', zIndex: '9' }}
          />
          <div className='modal-body px-4 pt-5'>
            <div className='pb10'>
              <h4 className='text-black mb-3'>
                {fid
                  ? `Νέο Μήνυμα προς ${displayName}`
                  : `Για να επικοινωνήσεις πρέπει να έχεις λογαριασμό`}
              </h4>
            </div>
            <div className='row justify-content-center align-items-center'>
              {fid ? (
                <StartChatForm
                  fid={fid}
                  freelancerId={freelancerId}
                  title={title}
                />
              ) : (
                <div className='auth-btns'>
                  <LinkNP
                    className='mr15-xl mr10 ud-btn btn-dark add-joining bdrs50 dark-color bg-transparent'
                    href='/login'
                    onClick={handleLinkClick}
                  >
                    Σύνδεση
                  </LinkNP>
                  <LinkNP
                    className='mr15-xl mr10 ud-btn btn-dark add-joining bdrs50 dark-color bg-transparent'
                    href='/register'
                    onClick={handleLinkClick}
                  >
                    Εγγραφή
                  </LinkNP>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
