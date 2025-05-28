'use client';

import React, {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { createIssueReport } from '@/actions';
import { useFormChanges } from '@/hooks/useFormChanges';

import Alert from '../alert/alert-form';
import SaveButton from '../button/button-form-save';
import CheckSelect from '../input/input-check-select';
import TextArea from '../input/input-text-area';
import ReportIssueModal from '../modal/modal-report-issue';

/**
 * Initial state for the report issue form.
 */
const initialFormState = {
  issueType: { data: [] },
  description: '',
};

/**
 * Initial state for the action
 */
const initialActionState = {
  message: null,
  error: null,
  errors: null,
  success: null,
};

/**
 * ReportIssueForm component allows users to submit issue reports.
 */
export default function ReportIssueForm() {
  const [state, formAction, isPending] = useActionState(
    createIssueReport,
    initialActionState,
  );

  const [formValues, setFormValues] = useState(initialFormState);

  const [currentUrl, setCurrentUrl] = useState('');

  const [isPendingTransition, startTransition] = useTransition();

  const closeButtonRef = useRef(null);

  const pathname = usePathname();

  const searchParams = useSearchParams();

  const [currentHash, setCurrentHash] = useState('');

  const { changes, hasChanges } = useFormChanges(formValues, initialFormState);

  /**
   * Handles changes to form inputs.
   */
  const handleInputChange = (value, name) => {
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Reset the action state by calling the action without formData
   */
  const resetActionState = () => {
    startTransition(() => {
      formAction(); // Call without formData to trigger reset
    });
  };

  /**
   * Options for the issue type selector.
   */
  const issueOptions = [
    { id: 'bug_report', label: 'Αναφορά Προβλήματος', slug: 'bug_report' },
    {
      id: 'new_option',
      label: 'Προσθήκη μιας νέας επιλογής',
      slug: 'new_option',
    },
    {
      id: 'feature_request',
      label: 'Πρόταση νέας δυνατότητας',
      slug: 'feature_request',
    },
  ];

  // Effect to update currentHash when window.location.hash changes
  useEffect(() => {
    const updateHash = () => {
      setCurrentHash(window.location.hash);
    };

    // Set initial hash
    if (typeof window !== 'undefined') {
      updateHash();
    }
    window.addEventListener('hashchange', updateHash);

    return () => {
      window.removeEventListener('hashchange', updateHash);
    };
  }, []);
  // Set the current URL when the component mounts or relevant parts change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const paramsString = searchParams.toString();

      const queryString = paramsString ? `?${paramsString}` : '';

      // Use currentHash from state, ensuring it's an empty string if not present
      const hashString = currentHash || '';

      const fullUrl =
        window.location.origin + pathname + queryString + hashString;

      setCurrentUrl(fullUrl);
    }
  }, [pathname, searchParams, currentHash]); // Add currentHash to dependencies
  // Handle success and reset everything
  useEffect(() => {
    if (state.success) {
      // Reset form values immediately
      setFormValues(initialFormState);

      // Close modal and reset action state after delay
      const timer = setTimeout(() => {
        if (closeButtonRef.current) {
          closeButtonRef.current.click();
        }
        // Reset action state after modal closes
        setTimeout(() => {
          resetActionState();
        }, 500);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [state.success]);
  // Reset form when modal is manually closed (without success)
  useEffect(() => {
    const modalElement = document.getElementById('reportIssueModal');

    const handleModalHidden = () => {
      if (!state.success) {
        // Reset form values on manual close
        setFormValues(initialFormState);
      } else {
        // Reset action state after successful submission and modal close
        resetActionState();
      }
    };

    if (modalElement) {
      modalElement.addEventListener('hidden.bs.modal', handleModalHidden);

      return () => {
        modalElement.removeEventListener('hidden.bs.modal', handleModalHidden);
      };
    }
  }, [state.success]);

  return (
    <ReportIssueModal closeButtonRef={closeButtonRef}>
      <form action={formAction} className='w-100'>
        <input type='hidden' name='currentUrl' value={currentUrl} />
        <div className='mb-3'>
          <CheckSelect
            label='Είδος ζητήματος'
            name='issueType'
            options={issueOptions}
            selectedValues={formValues.issueType}
            onChange={(selected) => handleInputChange(selected, 'issueType')}
            maxSelections={1}
            showSelectionsCount={false}
            error={state?.errors?.issueType?.[0]}
          />
          <input
            type='hidden'
            name='issueType'
            value={formValues.issueType?.data?.[0]?.id || ''}
          />
        </div>
        <div className='mb-3'>
          <TextArea
            label='Περιγραφή'
            name='description'
            placeholder='Περιέγραψε το ζητήμα και θα το ελέγξουμε άμεσα'
            value={formValues.description}
            onChange={(value) => handleInputChange(value, 'description')}
            rows={4}
            maxLength={500}
            counter
            errors={state?.errors}
          />
          <input
            type='hidden'
            name='description'
            value={formValues.description}
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
              typeof state.error === 'string' ? state.error : 'Προέκυψε σφάλμα.'
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
          icon='fa-solid fa-paper-plane'
        />
      </form>
    </ReportIssueModal>
  );
}
