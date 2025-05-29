'use client';

import React, {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react';
import Link from 'next/link';

import { FreelancerReportModal } from '@/components/modal';
import { useFormChanges } from '@/hooks/useFormChanges';
import useModalCleanup from '@/hooks/useModalCleanup';

import { AlertForm } from '../alert';
import { SaveButton } from '../button';
import { TextArea } from '../input';
import { createFreelancerReport } from '@/actions/tenant/report';

/**
 * @constant {object} initialFormState
 * @description Initial state for the freelancer report form fields.
 * @property {string} description - The description of the freelancer report.
 */
const initialFormState = {
  description: '',
};

/**
 * @constant {object} initialActionState
 * @description Initial state for the form action, handling responses like messages, errors, and success status.
 * @property {string|null} message - A general message from the action.
 * @property {string|null} error - An error message if the action failed.
 * @property {object|null} errors - Specific field errors from validation.
 * @property {boolean|null} success - Indicates if the action was successful.
 */
const initialActionState = {
  message: null,
  error: null,
  errors: null,
  success: null,
};

/**
 * FreelancerReportForm component allows users to submit freelancer-specific reports.
 * It handles form state, input changes, submission, and response feedback.
 * @param {object} props - Component props.
 * @param {object} props.reporter - Object containing details of the user submitting the report.
 * @param {string|number} props.reporter.id - ID of the reporter.
 * @param {string} [props.reporter.email] - Email of the reporter.
 * @param {string} [props.reporter.displayName] - Display name of the reporter.
 * @param {string} [props.reporter.username] - Username of the reporter.
 * @param {object} props.reported - Object containing details of the freelancer being reported.
 * @param {string|number} props.reported.id - ID of the reported freelancer.
 * @param {string} props.reported.email - Email of the reported freelancer.
 * @param {string} props.reported.displayName - Display name of the reported freelancer.
 * @param {string} [props.reported.username] - Username of the reported freelancer.
 * @returns {JSX.Element} The freelancer report form component.
 */
export default function FreelancerReportForm({ reporter, reported }) {
  const [state, formAction, isPending] = useActionState(
    createFreelancerReport,
    initialActionState,
  );

  const [formValues, setFormValues] = useState(initialFormState);

  const [currentUrl, setCurrentUrl] = useState('');

  const [isPendingTransition, startTransition] = useTransition();

  const closeButtonRef = useRef(null);

  const { changes, hasChanges } = useFormChanges(formValues, initialFormState);

  const { handleLinkClick } = useModalCleanup('freelancerReportModal');

  /**
   * @function handleInputChange
   * @description Updates the form state when an input field changes.
   * @param {string|number} value - The new value of the input field.
   * @param {string} name - The name of the input field.
   */
  const handleInputChange = (value, name) => {
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * @function resetActionState
   * @description Resets the form action state.
   */
  const resetActionState = () => {
    startTransition(() => {
      formAction();
    });
  };

  /**
   * @effect
   * @description Sets the current URL of the page when the component mounts.
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);
  /**
   * @effect
   * @description Handles the success state after a form submission.
   */
  useEffect(() => {
    if (state.success) {
      setFormValues(initialFormState);

      const timer = setTimeout(() => {
        if (closeButtonRef.current) {
          closeButtonRef.current.click();
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [state.success]);
  /**
   * @effect
   * @description Sets up an event listener to reset form values and action state
   * when the freelancer report modal ('freelancerReportModal') is closed.
   */
  useEffect(() => {
    const modalElement = document.getElementById('freelancerReportModal');

    const handleModalHidden = () => {
      setFormValues(initialFormState);
      resetActionState();
    };

    if (modalElement) {
      modalElement.addEventListener('hidden.bs.modal', handleModalHidden);

      return () => {
        modalElement.removeEventListener('hidden.bs.modal', handleModalHidden);
      };
    }
  }, []);

  return (
    <FreelancerReportModal closeButtonRef={closeButtonRef}>
      {' '}
      {reporter?.id ? (
        <form action={formAction} className='w-100'>
          <input type='hidden' name='currentUrl' value={currentUrl} />
          <input
            type='hidden'
            name='reporter'
            value={JSON.stringify(reporter)}
          />
          <input
            type='hidden'
            name='reported'
            value={JSON.stringify(reported)}
          />
          <div className='mb-3'>
            <TextArea
              label='Περιγραφή Αναφοράς'
              name='description'
              placeholder='Περιγράψε το ζήτημα σχετικά με το προφίλ και θα το ελέγξουμε άμεσα'
              value={formValues.description}
              onChange={(value) => handleInputChange(value, 'description')}
              rows={4}
              maxLength={500}
              counter
              errors={state?.errors}
            />
          </div>
          {state.message && (
            <AlertForm
              type={state.error ? 'error' : 'success'}
              message={state.message}
              className='mt-3'
              show={!!state.message}
            />
          )}
          {state.error && !state.message && (
            <AlertForm
              type='error'
              message={
                typeof state.error === 'string'
                  ? state.error
                  : 'Προέκυψε σφάλμα κατά την υποβολή της αναφοράς.'
              }
              className='mt-3'
              show={!!state.error && !state.message}
            />
          )}
          <SaveButton
            defaultText='Αποστολή Αναφοράς Προφίλ'
            loadingText='Αποστολή...'
            isPending={isPending || isPendingTransition}
            hasChanges={hasChanges}
            disabled={isPending || isPendingTransition || !hasChanges}
            className='w-100'
            icon='fa-solid fa-paper-plane'
          />
        </form>
      ) : (
        <div className='text-center'>
          <h4 className='text-black mb-3'>
            Για να κάνεις αναφορά προφίλ πρέπει να έχεις λογαριασμό
          </h4>
          <div className='auth-btns'>
            <Link
              className='mr15-xl mr10 ud-btn btn-dark add-joining bdrs50 dark-color bg-transparent'
              href='/login'
              onClick={handleLinkClick}
            >
              Σύνδεση
            </Link>
            <Link
              className='mr15-xl mr10 ud-btn btn-dark add-joining bdrs50 dark-color bg-transparent'
              href='/register'
              onClick={handleLinkClick}
            >
              Εγγραφή
            </Link>
          </div>
        </div>
      )}
    </FreelancerReportModal>
  );
}
