"use client";

import React, { useState } from "react";
import { useActionState } from "react";
import { updateBillingDetails } from "@/lib/profile/update";
import useEditProfileStore from "@/store/dashboard/profile";
import InputB from "@/components/inputs/InputB";
import Alert from "../../alerts/Alert";
import SaveButton from "../../buttons/SaveButton";
import RadioSelect from "../../Archives/Inputs/RadioSelect";
import { useFormChanges } from "@/hook/useFormChanges";

export default function VerificationForm() {
  const initialState = {
    data: null,
    errors: {},
    message: null,
  };

  const [formState, formAction, isPending] = useActionState(
    updateBillingDetails,
    initialState
  );

  const originalValues = {
    afm: null,
    brandName: "",
    address: "",
    phone: "",
  };

  const [verification, setVerification] = useState(originalValues);

  const handleFieldChange = (name, value) => {
    setVerification((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const { changes, hasChanges } = useFormChanges(verification, originalValues);

  const handleSubmit = async (formData) => {
    formData.append("billing_details", JSON.stringify(billing_details));
    return formAction(formData);
  };

  return (
    <form action={handleSubmit}>
      <div className="form-style1">
        <div className="bdrb1 pb15 mb25">
          <h5 className="list-title heading">Αίτηση Ταυτοποίησης</h5>
        </div>
        <div className="row">
          <div className="col-sm-3 mb20">
            <InputB
              label="ΑΦΜ"
              id="afm"
              name="afm"
              type="number"
              value={verification?.afm}
              onChange={(value) => handleFieldChange("afm", value)}
              maxLength={9}
              className="form-control"
              errors={formState?.errors?.afm}
            />
          </div>
          <div className="col-sm-3 mb20">
            <InputB
              label="Επωνυμία"
              id="brandName"
              name="brandName"
              type="text"
              value={verification?.brandName}
              onChange={(value) => handleFieldChange("brandName", value)}
              maxLength={50}
              className="form-control"
              errors={formState?.errors?.brandName}
            />
          </div>
          <div className="col-sm-3 mb20">
            <InputB
              label="Διεύθυνση Τιμολόγησης"
              id="address"
              name="address"
              type="text"
              value={verification?.address}
              onChange={(value) => handleFieldChange("address", value)}
              className="form-control"
              errors={formState?.errors?.address}
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
              value={verification?.phone}
              onChange={(value) => handleFieldChange("phone", value)}
              className="form-control input-group"
              errors={formState?.errors?.phone}
            />
          </div>
        </div>
        {formState?.errors && (
          <Alert
            type="error"
            message={formState.errors.submit}
            className="mt-3"
          />
        )}

        {formState?.message && !formState?.errors?.submit && (
          <Alert type="success" message={formState.message} className="mt-3" />
        )}

        <SaveButton
          orientation="end"
          isPending={isPending}
          hasChanges={hasChanges}
          variant="primary"
          icon="fa-solid fa-paper-plane"
          defaultText="Αποστολή Αίτησης"
          loadingText="Αποστολή Αίτησης"
        />
      </div>
    </form>
  );
}
