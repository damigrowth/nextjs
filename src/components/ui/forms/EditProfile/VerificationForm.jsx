"use client";

import React, { useMemo, useState } from "react";
import { useActionState } from "react";
import { verificationUpdate } from "@/lib/profile/update";
import InputB from "@/components/inputs/InputB";
import Alert from "../../alerts/Alert";
import SaveButton from "../../buttons/SaveButton";
import { useFormChanges } from "@/hook/useFormChanges";
import PulsatingDot from "../../PulsatingDot";

/**
 * @typedef {object} VerificationData
 * @property {object} [data] - The main data object for verification.
 * @property {string} [data.id] - The ID of the verification record.
 * @property {object} [data.attributes] - Attributes of the verification record.
 * @property {string|null} [data.attributes.afm] - The AFM (tax number).
 * @property {string} [data.attributes.brandName] - The brand name.
 * @property {string} [data.attributes.address] - The billing address.
 * @property {string|null} [data.attributes.phone] - The phone number.
 * @property {object} [data.attributes.status] - The status object.
 * @property {object} [data.attributes.status.data] - The data for the status.
 * @property {object} [data.attributes.status.data.attributes] - Attributes of the status.
 * @property {string} [data.attributes.status.data.attributes.type] - The type of verification status (e.g., "Active", "Pending").
 */

/**
 * @typedef {object} FormState
 * @property {any} data - Data returned from the server action.
 * @property {object} errors - Validation errors from the server action.
 * @property {string|null} message - A message from the server action (e.g., success message).
 */

/**
 * VerificationForm component for freelancers to submit or view their verification details.
 * It handles displaying the current verification status and allows users to submit
 * verification information like AFM, brand name, address, and phone.
 *
 * @param {object} props - The component's props.
 * @param {string} props.fid - The freelancer ID.
 * @param {string} props.email - The freelancer's email.
 * @param {VerificationData} props.verificationData - Existing verification data for the freelancer.
 * @returns {JSX.Element} The verification form component.
 */
export default function VerificationForm({ fid, email, verificationData }) {
  /**
   * Initial state for the form action.
   * @type {FormState}
   */
  const initialState = {
    data: null,
    errors: {},
    message: null,
  };

  const [formState, formAction, isPending] = useActionState(
    verificationUpdate,
    initialState
  );

  /**
   * Original values of the verification form, derived from `verificationData` prop.
   * Used to track changes in the form.
   * @type {{id: string|null, afm: string|null, brandName: string, address: string, phone: string|null}}
   */
  const originalValues = {
    id: verificationData?.data?.id || null,
    afm: verificationData?.data?.attributes?.afm || null,
    brandName: verificationData?.data?.attributes?.brandName || "",
    address: verificationData?.data?.attributes?.address || "",
    phone: verificationData?.data?.attributes?.phone || null,
  };

  const [verification, setVerification] = useState(originalValues);
  const [title, setTitle] = useState("Αίτηση Πιστοποίησης");
  const [showForm, setShowForm] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  /**
   * The type of the current verification status (e.g., "Active", "Pending").
   * Extracted from `verificationData`.
   * @type {string|undefined}
   */
  const verificationStatusType =
    verificationData?.data?.attributes?.status?.data?.attributes?.type;

  /**
   * Determines and sets the form's title, visibility, and disabled state
   * based on the `verificationStatusType`.
   * This function is memoized using `useMemo` to run only when `verificationStatusType` changes.
   */
  const getVerificationStatus = () => {
    if (verificationStatusType === "Active") {
      setTitle("Πιστοποιημένο Προφίλ");
      setShowForm(false);
      setIsDisabled(false);
    } else if (verificationStatusType === "Pending") {
      setTitle("Πιστοποίηση σε Εξέληξη");
      setShowForm(true);
      setIsDisabled(true);
    } else {
      setTitle("Αίτηση Πιστοποίησης");
      setShowForm(true);
      setIsDisabled(false);
    }
  };

  /**
   * `useMemo` hook to call `getVerificationStatus` when `verificationStatusType` changes.
   * This updates the UI elements like title and form visibility based on the status.
   */
  useMemo(() => getVerificationStatus(), [verificationStatusType]);

  /**
   * Handles changes to form input fields.
   * Updates the `verification` state.
   * Converts "afm" and "phone" fields to numbers, or null if empty.
   *
   * @param {string} name - The name of the input field.
   * @param {string} value - The new value of the input field.
   */
  const handleFieldChange = (name, value) => {
    if (name === "afm" || name === "phone") {
      const numValue = value && value.trim() !== "" ? Number(value) : null;
      setVerification((prevState) => ({
        ...prevState,
        [name]: numValue,
      }));
    } else {
      setVerification((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const { changes, hasChanges } = useFormChanges(verification, originalValues);

  const handleSubmit = async (formData) => {
    return formAction(formData);
  };

  return (
    <form action={handleSubmit}>
      <div className="form-style1">
        <div className={`${!showForm ? "" : "bdrb1 pb15 mb25"}`}>
          <div className="d-flex align-items-center mb10">
            {!showForm && (
              <i className="d-block flaticon-success fa-xl text-thm vam mr10" />
            )}
            {isDisabled && (
              <PulsatingDot
                color="#ff9800"
                size={10}
                ringSize={20}
                animationDuration={1.5}
                className="mr10"
              />
            )}
            <h5 className="d-block list-title heading mb-0">{title}</h5>
          </div>
          {isDisabled && (
            <p className="mb-0">
              Η αίτηση πιστοποίησης έχει υποβληθεί και είναι σε κατάσταση
              αξιολόγησης.
            </p>
          )}
        </div>
        {showForm && (
          <>
            <div className="row">
              <input type="hidden" name="fid" value={fid} />
              <input type="hidden" name="email" value={email} />
              <input
                type="hidden"
                name="verificationId"
                value={verification.id}
              />
              <div className="col-sm-3 mb20">
                <InputB
                  label="ΑΦΜ*"
                  id="afm"
                  name="afm"
                  type="text"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  value={verification.afm !== null ? verification.afm : ""}
                  onChange={(value) => handleFieldChange("afm", value)}
                  maxLength={9}
                  className="form-control"
                  errors={formState?.errors?.afm}
                  disabled={isDisabled}
                />
              </div>
              <div className="col-sm-3 mb20">
                <InputB
                  label="Επωνυμία"
                  id="brandName"
                  name="brandName"
                  type="text"
                  value={verification.brandName}
                  onChange={(value) => handleFieldChange("brandName", value)}
                  maxLength={50}
                  className="form-control"
                  errors={formState?.errors?.brandName}
                  disabled={isDisabled}
                />
              </div>
              <div className="col-sm-3 mb20">
                <InputB
                  label="Διεύθυνση Τιμολόγησης"
                  id="address"
                  name="address"
                  type="text"
                  value={verification.address}
                  onChange={(value) => handleFieldChange("address", value)}
                  className="form-control"
                  errors={formState?.errors?.address}
                  disabled={isDisabled}
                />
              </div>
              <div className="col-md-3 mb20">
                <InputB
                  label="Τηλέφωνο"
                  id="phone"
                  name="phone"
                  type="tel"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  maxLength={10}
                  value={verification.phone !== null ? verification.phone : ""}
                  onChange={(value) => handleFieldChange("phone", value)}
                  className="form-control input-group"
                  errors={formState?.errors?.phone}
                  disabled={isDisabled}
                />
              </div>
            </div>
            {formState?.errors?.submit && (
              <Alert
                type="error"
                message={formState.errors.submit.message}
                className="mt-3"
              />
            )}

            {formState?.message && !formState?.errors?.submit && (
              <Alert
                type="success"
                message={formState.message}
                className="mt-3"
              />
            )}

            <SaveButton
              orientation="end"
              disabled={isDisabled || !hasChanges}
              isPending={isPending}
              hasChanges={hasChanges}
              variant="primary"
              icon="fa-solid fa-paper-plane"
              defaultText="Αποστολή Αίτησης"
              loadingText="Αποστολή Αίτησης"
            />
          </>
        )}
      </div>
    </form>
  );
}
