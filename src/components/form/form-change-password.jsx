'use client';

import { useActionState, useEffect, useState } from 'react';

import Alert from '@/components/alert/alert-form';
import { SaveButton } from '@/components/button';
import { InputB } from '@/components/input';
import { IconKey } from '@/components/icon/fa';

import ChangePasswordModal from '../modal/modal-change-password';
import {
  successfulPasswordChange,
  updatePassword,
} from '@/actions/tenant/password';

/**
 * @typedef {object} FormState
 * @property {object|null} data - Data returned on successful action.
 * @property {object|null} errors - Validation or submission errors.
 * @property {string|null} message - A general message from the action.
 * @property {boolean} success - Indicates if the action was successful.
 */
/**
 * ChangePasswordForm component allows users to update their password.
 * It uses a server action (`updatePassword`) to handle the password change logic
 * and another server action (`successfulPasswordChange`) for post-success tasks like
 * token removal and cache revalidation.
 * The form includes fields for current password, new password, and confirmation,
 * with client-side state management for these inputs and form submission state.
 *
 * @returns {JSX.Element} The change password form component.
 */
export default function ChangePasswordForm() {
  /** @type {FormState} */
  const initialState = {
    data: null,
    errors: null,
    message: null,
    success: false,
  };

  /**
   * Manages the form's submission state, including data, errors, messages, and success status.
   * `formAction` is the function to call to trigger the `updatePassword` server action.
   * `isPending` indicates if the form submission is currently in progress.
   * @type {[FormState, (payload: FormData) => void, boolean]}
   */
  const [formState, formAction, isPending] = useActionState(
    updatePassword,
    initialState,
  );

  /**
   * State for the current password input field.
   * @type {[string, React.Dispatch<React.SetStateAction<string>>]}
   */
  const [currentPassword, setCurrentPassword] = useState('');

  /**
   * State for the new password input field.
   * @type {[string, React.Dispatch<React.SetStateAction<string>>]}
   */
  const [newPassword, setNewPassword] = useState('');

  /**
   * State for the confirm new password input field.
   * @type {[string, React.Dispatch<React.SetStateAction<string>>]}
   */
  const [confirmPassword, setConfirmPassword] = useState('');

  /**
   * Effect hook to handle side effects upon successful password update.
   * When `formState.success` becomes true, it:
   * 1. Clears the password input fields.
   * 2. Cleans up modal-related styles from the body
   *    to prevent issues upon redirection or UI changes.
   * 3. Calls the `successfulPasswordChange` server action to perform tasks like
   *    token removal and cache revalidation.
   */
  useEffect(() => {
    if (formState.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      }, 0);
      successfulPasswordChange().then((result) => {
        if (!result.success) {
          console.error(
            'Client: Post password change actions failed.',
            result.error,
          );
        }
      });
    }
  }, [formState.success]);

  return (
    <ChangePasswordModal
      id='changePasswordModal'
      title='Αλλαγή Κωδικού Πρόσβασης'
    >
      <div className='ps-widget bgc-white bdrs4 pt10 pl30 pr30 pb30 overflow-hidden position-relative'>
        <div className='col-lg-12'>
          <div className='row'>
            <form action={formAction} className='form-style1'>
              <div className='row'>
                <div className='col-sm-12'>
                  <InputB
                    label='Ισχύον Κωδικός'
                    id='currentPassword'
                    name='currentPassword'
                    type='password'
                    value={currentPassword}
                    onChange={(value) => setCurrentPassword(value)}
                    placeholder='********'
                    className='form-control'
                    errors={formState.errors?.currentPassword}
                    autoComplete='current-password'
                    disabled={isPending}
                    required
                  />
                </div>
                <div className='col-sm-12'>
                  <InputB
                    label='Νέος Κωδικός'
                    id='newPassword'
                    name='newPassword'
                    type='password'
                    value={newPassword}
                    onChange={(value) => setNewPassword(value)}
                    placeholder='********'
                    className='form-control'
                    errors={formState.errors?.newPassword}
                    disabled={isPending}
                    required
                  />
                </div>
                <div className='col-sm-12'>
                  <InputB
                    label='Επανάληψη Κωδικού'
                    id='confirmPassword'
                    name='confirmPassword'
                    type='password'
                    value={confirmPassword}
                    onChange={(value) => setConfirmPassword(value)}
                    placeholder='********'
                    className='form-control'
                    errors={formState.errors?.confirmPassword}
                    disabled={isPending}
                    required
                  />
                </div>
                {formState.errors?.submit && (
                  <div className='col-12 mt-3'>
                    <Alert
                      type='error'
                      message={formState.errors.submit.message}
                    />
                  </div>
                )}
                {formState.message && formState.success && (
                  <div className='col-12 mt-3'>
                    <Alert type='success' message={formState.message} />
                  </div>
                )}
                {!formState.success &&
                  formState.message &&
                  !formState.errors?.submit && (
                    <div className='col-12 mt-3'>
                      <Alert type='error' message={formState.message} />
                    </div>
                  )}
                <SaveButton
                  orientation='start'
                  isPending={isPending}
                  hasChanges={
                    currentPassword.trim() !== '' &&
                    newPassword.trim() !== '' &&
                    confirmPassword.trim() !== ''
                  }
                  defaultText='Αλλαγή Κωδικού'
                  IconComponent={IconKey}
                  type='regular'
                  variant='primary'
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </ChangePasswordModal>
  );
}
