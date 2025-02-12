"use client";

import InputB from "@/components/inputs/InputB";
import { updateAccountInfo } from "@/lib/profile/update";
import { useActionState } from "react";
import SaveButton from "../../buttons/SaveButton";
import useEditProfileStore from "@/store/dashboard/profile";
import { useEffect } from "react";
import Alert from "../../alerts/Alert";

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

  const {
    email,
    username,
    displayName,
    phone,
    address,
    setDisplayName,
    setPhone,
    setAddress,
    setProfile,
  } = useEditProfileStore();

  useEffect(() => {
    setProfile(freelancer);
  }, []);

  const getChangedFields = () => {
    const changes = {};

    if (displayName !== freelancer.displayName) {
      changes.displayName = displayName;
    }
    if (phone !== freelancer.phone) {
      changes.phone = phone;
    }
    if (address !== freelancer.address) {
      changes.address = address;
    }

    return changes;
  };

  const hasChanges = () => {
    return Object.keys(getChangedFields()).length > 0;
  };

  return (
    <form
      action={async (formData) => {
        const changedFields = getChangedFields();
        formData.append("id", freelancer.id);
        formData.append("changes", JSON.stringify(changedFields));
        return formAction(formData);
      }}
      className="ps-widget bdrs4 position-relative"
    >
      <div className="form-style1">
        <div className="bdrb1 pb15 mb25">
          <h5 className="list-title heading">Λογαριασμός</h5>
        </div>
        <div className="row">
          <div className="mb10 col-md-3">
            <InputB
              label="Email"
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
              label="Username"
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
              label="Όνομα προβολής"
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
              value={phone || ""}
              onChange={setPhone}
              className="form-control input-group"
              errors={formState?.errors?.phone}
            />
          </div>
          <div className="mb10 col-md-4">
            <InputB
              label="Διεύθυνση"
              id="address"
              name="address"
              type="text"
              value={address}
              onChange={setAddress}
              className="form-control input-group"
              errors={formState?.errors?.address}
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
          hasChanges={hasChanges()}
        />
      </div>
    </form>
  );
}
