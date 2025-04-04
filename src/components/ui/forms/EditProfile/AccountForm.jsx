"use client";

import InputB from "@/components/inputs/InputB";
import { updateAccountInfo } from "@/lib/profile/update";
import { useActionState } from "react";
import SaveButton from "../../buttons/SaveButton";
import useEditProfileStore from "@/store/dashboard/profile";
import Alert from "../../alerts/Alert";
import { useFormChanges } from "@/hook/useFormChanges";
import DeleteAccountForm from "../DeleteAccountForm";
import DeleteModal from "@/components/dashboard/modal/DeleteModal";

export default function AccountForm({ freelancer }) {
  const initialState = {
    data: null,
    errors: {},
    message: null,
  };

  const [formState, formAction, isPending] = useActionState(
    updateAccountInfo,
    initialState
  );

  const { email, username, displayName, phone, setDisplayName, setPhone } =
    useEditProfileStore();

  const currentValues = { 
    displayName, 
    phone: phone ? Number(phone) : null 
  };
  const originalValues = {
    displayName: freelancer.displayName,
    phone: freelancer.phone ? Number(freelancer.phone) : null,
  };

  // // Use custom hook to track changes
  const { changes, hasChanges } = useFormChanges(currentValues, originalValues);

  const handleSubmit = async (formData) => {
    formData.append("id", freelancer.id);
    formData.append("changes", JSON.stringify(changes));
    return formAction(formData);
  };

  return (
    <>
      <form action={handleSubmit} className="ps-widget bdrs4 position-relative">
        <div className="form-style1">
          <div className="bdrb1 pb15 mb25">
            <h5 className="list-title heading">Λογαριασμός</h5>
          </div>
          <div className="row">
            <div className="mb10 col-md-3">
              <InputB
                label="Email*"
                id="email"
                name="email"
                type="email"
                value={email}
                className="form-control input-group"
                disabled={true}
              />
            </div>
            <div className="mb10 col-md-3">
              <InputB
                label="Username*"
                id="username"
                name="username"
                type="text"
                value={username}
                className="form-control input-group"
                disabled={true}
              />
            </div>
            <div className="mb10 col-md-3">
              <InputB
                label="Όνομα προβολής*"
                id="displayName"
                name="displayName"
                type="text"
                value={displayName}
                onChange={setDisplayName}
                className="form-control input-group"
                errors={formState?.errors?.displayName}
              />
            </div>
            <div className="mb10 col-md-3">
              <InputB
                label="Τηλέφωνο"
                id="phone"
                name="phone"
                type="tel"
                pattern="[0-9]*"
                inputMode="numeric"
                value={phone || ""}
                onChange={setPhone}
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
            <Alert
              type="success"
              message={formState.message}
              className="mt-3"
            />
          )}

          <SaveButton
            orientation="end"
            isPending={isPending}
            hasChanges={hasChanges}
            variant="primary"
          />
        </div>
      </form>
      <DeleteAccountForm username={username} />
    </>
  );
}
