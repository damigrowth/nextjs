"use client";

"use client";

import React, {
  useActionState,
  useState,
  useEffect,
  useRef,
  useTransition,
} from "react";
import TextArea from "../../inputs/TextArea";
import SaveButton from "../buttons/SaveButton";
import { useFormChanges } from "@/hook/useFormChanges";
import Alert from "../alerts/Alert";
import { createServiceReport } from "@/lib/report/createServiceReport";
import ServiceReportModal from "@/components/modal/ServiceReportModal";
import Link from "next/link";
import useModalCleanup from "@/hook/useModalCleanup";

/**
 * @constant {object} initialFormState
 * @description Initial state for the service report form fields.
 * @property {string} description - The description of the service report.
 */
const initialFormState = {
  description: "",
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
 * @param {object} props - Component props.
 * @param {string|number} props.fid - ID of the freelancer being reported.
 * @param {string} props.email - Email of the freelancer being reported.
 * @param {string} props.displayName - Display name of the freelancer being reported.
 * @param {string|number} props.serviceId - ID of the service being reported.
 * @param {string} props.title - Title of the service being reported.
 * @returns {JSX.Element} The service report form component.
 */
export default function ServiceReportForm({
  fid,
  email,
  displayName,
  serviceId,
  title,
}) {
  const [state, formAction, isPending] = useActionState(
    createServiceReport,
    initialActionState
  );
  const [formValues, setFormValues] = useState(initialFormState);
  const [currentUrl, setCurrentUrl] = useState("");
  const [isPendingTransition, startTransition] = useTransition();
  const closeButtonRef = useRef(null);

  const { changes, hasChanges } = useFormChanges(formValues, initialFormState);

  const { handleLinkClick } = useModalCleanup("serviceReportModal");

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
    if (typeof window !== "undefined") {
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
    const modalElement = document.getElementById("serviceReportModal");

    const handleModalHidden = () => {
      setFormValues(initialFormState);
      resetActionState();
    };

    if (modalElement) {
      modalElement.addEventListener("hidden.bs.modal", handleModalHidden);
      return () => {
        modalElement.removeEventListener("hidden.bs.modal", handleModalHidden);
      };
    }
  }, []);

  return (
    <ServiceReportModal closeButtonRef={closeButtonRef}>
      {fid ? (
        <form action={formAction} className="w-100">
          <input type="hidden" name="currentUrl" value={currentUrl} />
          <input type="hidden" name="serviceId" value={serviceId || ""} />
          <input type="hidden" name="title" value={title || ""} />
          <input type="hidden" name="fid" value={fid || ""} />
          <input type="hidden" name="email" value={email || ""} />
          <input type="hidden" name="displayName" value={displayName || ""} />

          <div className="mb-3">
            <TextArea
              label="Περιγραφή"
              name="description"
              placeholder="Περιγράψε το ζήτημα και θα το ελέγξουμε άμεσα"
              value={formValues.description}
              onChange={(value) => handleInputChange(value, "description")}
              rows={4}
              maxLength={500}
              counter
              errors={state?.errors}
            />
          </div>

          {state.message && (
            <Alert
              type={state.error ? "error" : "success"}
              message={state.message}
              className="mt-3"
              show={!!state.message}
            />
          )}
          {state.error && !state.message && (
            <Alert
              type="error"
              message={
                typeof state.error === "string"
                  ? state.error
                  : "Προέκυψε σφάλμα."
              }
              className="mt-3"
              show={!!state.error && !state.message}
            />
          )}

          <SaveButton
            defaultText="Αποστολή Αναφοράς"
            loadingText="Αποστολή..."
            isPending={isPending || isPendingTransition}
            hasChanges={hasChanges}
            disabled={isPending || isPendingTransition || !hasChanges}
            className="w-100"
            icon="fa-solid fa-paper-plane"
          />
        </form>
      ) : (
        <div className="text-center">
          <h4 className="text-black mb-3">
            Για να κάνεις αναφορά πρέπει να έχεις λογαριασμό
          </h4>
          <div className="auth-btns">
            <Link
              className="mr15-xl mr10 ud-btn btn-dark add-joining bdrs50 dark-color bg-transparent"
              href="/login"
              onClick={handleLinkClick}
            >
              Σύνδεση
            </Link>
            <Link
              className="mr15-xl mr10 ud-btn btn-dark add-joining bdrs50 dark-color bg-transparent"
              href="/register"
              onClick={handleLinkClick}
            >
              Εγγραφή
            </Link>
          </div>
        </div>
      )}
    </ServiceReportModal>
  );
}
