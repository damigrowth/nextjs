"use client";

import React from "react";
import { useActionState } from "react";
import { updateBillingDetails } from "@/lib/profile/update";
import useEditProfileStore from "@/store/dashboard/profile";
import InputB from "@/components/inputs/InputB";
import Alert from "../../alerts/Alert";
import SaveButton from "../../buttons/SaveButton";
import RadioSelect from "../../Archives/Inputs/RadioSelect";
import { useFormChanges } from "@/hook/useFormChanges";

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

  const { billing_details, setBillingDetails } = useEditProfileStore();

  const handleBillingTypeChange = (e) => {
    const selectedValue = e.target.value;
    setBillingDetails({
      ...billing_details,
      receipt: selectedValue === "receipt",
      invoice: selectedValue === "invoice",
    });
  };

  // Get current billing type value
  const getCurrentBillingType = () => {
    if (billing_details?.receipt) return "receipt";
    if (billing_details?.invoice) return "invoice";
    return ""; // Both false case
  };

  const { changes, hasChanges } = useFormChanges(
    billing_details,
    freelancer?.billing_details || {
      receipt: false,
      invoice: false,
      afm: null,
      doy: null,
      brandName: null,
      profession: null,
      address: null,
    }
  );

  const handleSubmit = async (formData) => {
    formData.append("id", freelancer.id);
    formData.append("billing_details", JSON.stringify(billing_details));
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
          hasChanges={hasChanges}
        />
      </div>
    </form>
  );
}
