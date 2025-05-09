"use client";

import React, { useMemo, useState } from "react";
import { useActionState } from "react";
import { verificationUpdate } from "@/lib/profile/update";
import useEditProfileStore from "@/store/dashboard/profile";
import InputB from "@/components/inputs/InputB";
import Alert from "../../alerts/Alert";
import SaveButton from "../../buttons/SaveButton";
import RadioSelect from "../../Archives/Inputs/RadioSelect";
import { useFormChanges } from "@/hook/useFormChanges";
import PulsatingDot from "../../PulsatingDot";

export default function VerificationForm({ fid, email, verificationData }) {
  const initialState = {
    data: null,
    errors: {},
    message: null,
  };

  const [formState, formAction, isPending] = useActionState(
    verificationUpdate,
    initialState
  );

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

  const verificationStatusType =
    verificationData?.data?.attributes?.status?.data?.attributes?.type;

  const getVerificationStatus = () => {
    if (verificationStatusType === "Active") {
      setTitle("Πιστοποιημένο Προφίλ");
      setShowForm(false);
    } else if (verificationStatusType === "Pending") {
      setTitle("Πιστοποίηση σε Εξέληξη");
      setShowForm(true);
      setIsDisabled(true);
    } else {
      setTitle("Αίτηση Πιστοποίησης");
      setShowForm(true);
    }
  };

  useMemo(() => getVerificationStatus(), [verificationStatusType]);

  const handleFieldChange = (name, value) => {
    // For afm and phone, handle numeric conversion
    if (name === "afm" || name === "phone") {
      // Convert to number if value exists and isn't empty, otherwise null
      const numValue = value && value.trim() !== "" ? Number(value) : null;
      setVerification((prevState) => ({
        ...prevState,
        [name]: numValue,
      }));
    } else {
      // For string fields, use the value directly
      setVerification((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const { changes, hasChanges } = useFormChanges(verification, originalValues);

  const handleSubmit = async (formData) => {
    // We'll let the server action and Zod schema handle the validation
    // and coercion of values through the standard form submission
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
              disabled={isDisabled}
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
