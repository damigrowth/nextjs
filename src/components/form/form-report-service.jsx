'use client';

import React, {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react';
import LinkNP from '@/components/link';

import { ServiceReportModal } from '@/components/modal';
import { useFormChanges } from '@/hooks/useFormChanges';
import useModalCleanup from '@/hooks/useModalCleanup';

import Alert from '../alert/alert-form';
import SaveButton from '../button/button-form-save';
import TextArea from '../input/input-text-area';
import { IconPaperPlane } from '@/components/icon/fa';
import { createServiceReport } from '@/actions/service/report';

/**
 * @constant {object} initialFormState
 * @description Initial state for the service report form fields.
 * @property {string} description - The description of the service report.
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
 * ServiceReportForm component allows users to submit service-specific reports.
 * It handles form state, input changes, submission, and response feedback.
 *
 * @param {object} props - Component props.
 * @param {object} props.reporter - The user submitting the report.
 * @param {string} props.reporter.id - ID of the reporter.
 * @param {string} [props.reporter.email] - Email of the reporter (optional).
 * @param {string} [props.reporter.displayName] - Display name of the reporter (optional).
 * @param {string} [props.reporter.username] - Username of the reporter (optional).
 * @param {object} props.reported - The freelancer being reported (owner of the service).
 * @param {string} props.reported.id - ID of the reported freelancer.
 * @param {string} [props.reported.email] - Email of the reported freelancer (optional).
 * @param {string} [props.reported.displayName] - Display name of the reported freelancer (optional).
 * @param {string} [props.reported.username] - Username of the reported freelancer (optional).
 * @param {object} props.service - The service being reported.
 * @param {string} props.service.id - ID of the service.
 * @param {string} props.service.title - Title of the service.
 * @returns {JSX.Element} The service report form component.
 */
export default function ServiceReportForm({ reporter, reported, service }) {
  /**
   * @type {[object, function, boolean]} state
   * @description Manages the state of the form action, including messages, errors, and success status.
   * `state`: The current state from the server action.
   * `formAction`: The function to trigger the server action.
   * `isPending`: A boolean indicating if the server action is currently pending.
   */
  const [state, formAction, isPending] = useActionState(
    createServiceReport,
    initialActionState,
  );

  /**
   * @type {[object, function]} formValues
   * @description Manages the values of the form fields (e.g., description).
   */
  const [formValues, setFormValues] = useState(initialFormState);

  /**
   * @type {[string, function]} currentUrl
   * @description Stores the current URL of the page, to be included in the report.
   */
  const [currentUrl, setCurrentUrl] = useState('');

  /**
   * @type {[boolean, function]} isPendingTransition
   * @description Manages the pending state for transitions, e.g., when resetting the action state.
   * `isPendingTransition`: A boolean indicating if a transition is pending.
   * `startTransition`: Function to start a new transition.
   */
  const [isPendingTransition, startTransition] = useTransition();

  /**
   * @type {React.RefObject} closeButtonRef
   * @description Ref for the modal's close button, used to programmatically close the modal.
   */
  const closeButtonRef = useRef(null);

  /**
   * @type {{changes: object, hasChanges: boolean}} useFormChangesResult
   * @description Custom hook to track changes in form values compared to their initial state.
   * `changes`: An object detailing which fields have changed.
   * `hasChanges`: A boolean indicating if any form field has changed.
   */
  const { changes, hasChanges } = useFormChanges(formValues, initialFormState);

  /**
   * @type {{handleLinkClick: function}} useModalCleanupResult
   * @description Custom hook to handle cleanup when a modal is closed via a link click (e.g., navigating away).
   */
  const { handleLinkClick } = useModalCleanup('serviceReportModal');

  /**
   * Updates the form state when an input field (e.g., description textarea) changes.
   * @function handleInputChange
   * @param {string|number} value - The new value of the input field.
   * @param {string} name - The name of the input field (e.g., "description").
   */
  const handleInputChange = (value, name) => {
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * @function resetActionState
   * @description Resets the form action state. This is typically called to clear previous submission feedback.
   * It calls the `formAction` without formData, which should be handled by `createServiceReport` to return an initial state.
   */
  const resetActionState = () => {
    startTransition(() => {
      formAction();
    });
  };

  /**
   * @effect
   * @description Sets the current URL of the page when the component mounts.
   * This URL is included in the service report.
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);
  /**
   * @effect
   * @description Handles the success state after a form submission.
   * Resets the form values and closes the modal after a short delay.
   * The action state is reset when the modal is fully hidden (handled by another useEffect).
   * @listens state.success
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
   * when the service report modal ('serviceReportModal') is closed (hidden).
   * This ensures the form is clean for the next time it's opened.
   */
  useEffect(() => {
    const modalElement = document.getElementById('serviceReportModal');

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
    <ServiceReportModal closeButtonRef={closeButtonRef}>
      {reporter.id ? (
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
          <input type='hidden' name='service' value={JSON.stringify(service)} />
          <div className='mb-3'>
            <TextArea
              label='Περιγραφή'
              name='description'
              placeholder='Περιγράψε το ζήτημα και θα το ελέγξουμε άμεσα'
              value={formValues.description}
              onChange={(value) => handleInputChange(value, 'description')}
              rows={4}
              maxLength={500}
              counter
              errors={state?.errors}
            />
          </div>
          {state.message && (
            <Alert
              type={state.error ? 'error' : 'success'}
              message={state.message}
              className='mt-3'
              show={!!state.message}
            />
          )}
          {state.error && !state.message && (
            <Alert
              type='error'
              message={
                typeof state.error === 'string'
                  ? state.error
                  : 'Προέκυψε σφάλμα.'
              }
              className='mt-3'
              show={!!state.error && !state.message}
            />
          )}
          <SaveButton
            defaultText='Αποστολή Αναφοράς'
            loadingText='Αποστολή...'
            isPending={isPending || isPendingTransition}
            hasChanges={hasChanges}
            disabled={isPending || isPendingTransition || !hasChanges}
            className='w-100'
            IconComponent={IconPaperPlane}
          />
        </form>
      ) : (
        <div className='text-center'>
          <h4 className='text-black mb-3'>
            Για να κάνεις αναφορά πρέπει να έχεις λογαριασμό
          </h4>
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
        </div>
      )}
    </ServiceReportModal>
  );
}
