"use client";

import React from "react";
import { useActionState } from "react";
import { updateBillingDetails } from "@/lib/profile/update";
import useEditProfileStore from "@/store/dashboard/profile";
import InputB from "@/components/inputs/InputB";
import Alert from "../../alerts/Alert";
import SaveButton from "../../buttons/SaveButton";
import RadioSelect from "../../Archives/Inputs/RadioSelect";

const billingOptions = [
  { value: "receipt", label: "Απόδειξη" },
  { value: "invoice", label: "Τιμολόγιο" },
];

export default function BillingDetailsForm({ freelancer }) {
  const initialState = {
    data: null,
    errors: {},
    message: null,
  };

  const [formState, formAction, isPending] = useActionState(
    updateBillingDetails,
    initialState
  );

  const { billing_details, setBillingDetails } = useEditProfileStore(
    (state) => ({
      billing_details: state.billing_details,
      setBillingDetails: state.setBillingDetails,
    })
  );

  const handleBillingTypeChange = (e) => {
    const selectedValue = e.target.value;
    setBillingDetails({
      ...billing_details,
      receipt: selectedValue === "receipt",
      invoice: selectedValue === "invoice",
      // Reset fields when switching to receipt
      ...(selectedValue === "receipt" && {
        afm: null,
        doy: null,
        brandName: null,
        profession: null,
        address: null,
      }),
    });
  };

  // Get current billing type value
  const getCurrentBillingType = () => {
    if (billing_details?.receipt) return "receipt";
    if (billing_details?.invoice) return "invoice";
    return ""; // Both false case
  };

  // Check for form changes
  const getChangedFields = () => {
    const changes = {};
    const current = billing_details || {};
    const original = freelancer.billing_details || {};

    // If original is empty AND we have any non-default values in current, include them
    if (Object.keys(original).length === 0) {
      // Only add fields that are different from initial state
      if (current.receipt !== false) changes.receipt = current.receipt;
      if (current.invoice !== false) changes.invoice = current.invoice;
      if (current.afm) changes.afm = current.afm;
      if (current.doy) changes.doy = current.doy;
      if (current.brandName) changes.brandName = current.brandName;
      if (current.profession) changes.profession = current.profession;
      if (current.address) changes.address = current.address;
    } else {
      // Compare with original values if they exist
      if (current.receipt !== original.receipt)
        changes.receipt = current.receipt;
      if (current.invoice !== original.invoice)
        changes.invoice = current.invoice;
      if (current.afm !== original.afm) changes.afm = current.afm;
      if (current.doy !== original.doy) changes.doy = current.doy;
      if (current.brandName !== original.brandName)
        changes.brandName = current.brandName;
      if (current.profession !== original.profession)
        changes.profession = current.profession;
      if (current.address !== original.address)
        changes.address = current.address;
    }

    return changes;
  };

  const hasChanges = () => {
    return Object.keys(getChangedFields()).length > 0;
  };

  const handleSubmit = async (formData) => {
    const changedFields = getChangedFields();
    formData.append("id", freelancer.id);
    formData.append("changes", JSON.stringify(changedFields));
    return formAction(formData);
  };

  return (
    <form action={handleSubmit}>
      <div className="form-style1">
        <div className="bdrb1 pb15 mb25">
          <h5 className="list-title heading">Στοιχεία Τιμολόγησης</h5>
        </div>

        <div className="mb20">
          <RadioSelect
            id="billing-type"
            name="billing-type"
            options={billingOptions}
            value={getCurrentBillingType()}
            onChange={handleBillingTypeChange}
            error={formState?.errors?.billing_type?.[0]}
            orientation="horizontal"
          />
        </div>

        {billing_details?.invoice && (
          <>
            <div className="row">
              <div className="col-sm-6 mb20">
                <InputB
                  label="ΑΦΜ"
                  id="afm"
                  name="afm"
                  type="number"
                  value={billing_details?.afm || ""}
                  onChange={(value) =>
                    setBillingDetails({
                      ...billing_details,
                      afm: value,
                    })
                  }
                  maxLength={9}
                  className="form-control"
                  errors={formState?.errors?.afm}
                />
              </div>
              <div className="col-sm-6 mb20">
                <InputB
                  label="ΔΟΥ"
                  id="doy"
                  name="doy"
                  type="text"
                  value={billing_details?.doy || ""}
                  onChange={(value) =>
                    setBillingDetails({
                      ...billing_details,
                      doy: value,
                    })
                  }
                  className="form-control"
                  errors={formState?.errors?.doy}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-sm-6 mb20">
                <InputB
                  label="Επωνυμία"
                  id="brandName"
                  name="brandName"
                  type="text"
                  value={billing_details?.brandName || ""}
                  onChange={(value) =>
                    setBillingDetails({
                      ...billing_details,
                      brandName: value,
                    })
                  }
                  className="form-control"
                  errors={formState?.errors?.brandName}
                />
              </div>
              <div className="col-sm-6 mb20">
                <InputB
                  label="Επάγγελμα"
                  id="profession"
                  name="profession"
                  type="text"
                  value={billing_details?.profession || ""}
                  onChange={(value) =>
                    setBillingDetails({
                      ...billing_details,
                      profession: value,
                    })
                  }
                  className="form-control"
                  errors={formState?.errors?.profession}
                />
              </div>
            </div>

            <div className="mb20">
              <InputB
                label="Διεύθυνση Τιμολόγησης"
                id="address"
                name="address"
                type="text"
                value={billing_details?.address || ""}
                onChange={(value) =>
                  setBillingDetails({
                    ...billing_details,
                    address: value,
                  })
                }
                className="form-control"
                errors={formState?.errors?.address}
              />
            </div>
          </>
        )}

        {formState?.errors?.submit && (
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
          hasChanges={hasChanges()}
        />
      </div>
    </form>
  );
}
