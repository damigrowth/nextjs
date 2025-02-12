"use client";

import useEditProfileStore from "@/store/dashboard/profile";
import { useActionState } from "react";
import { updatePresentationInfo } from "@/lib/profile/update";
import SaveButton from "../../buttons/SaveButton";
import SocialsInputs from "./SocialsInputs";
import InputB from "@/components/inputs/InputB";
import ServiceGallery from "../../AddService/ServiceGallery";
import SwitchB from "../../Archives/Inputs/SwitchB";

export default function PresentationForm() {
  const {
    username,
    website,
    setWebsite,
    visibility,
    setVisibility,
    socials,
    setSocial,
    portfolio,
    setPortfolio,
  } = useEditProfileStore();

  const initialState = {
    data: null,
    errors: {},
    message: null,
  };

  const [formState, formAction, isPending] = useActionState(
    updatePresentationInfo,
    initialState
  );

  const hasChanges = () => {};

  return (
    <form action={formAction}>
      <div className="form-style1">
        <div className="bdrb1 pb15 mb25">
          <h5 className="list-title heading">Παρουσίαση</h5>
        </div>

        <div className="mb10 col-md-3">
          <InputB
            label="Ιστότοπος"
            id="website"
            name="website"
            type="website"
            value={website}
            onChange={setWebsite}
            className="form-control input-group"
            error={formState.errors.website}
          />
        </div>

        <label className="form-label fw700 dark-color">Κοινονικά Προφίλ</label>
        <SocialsInputs
          data={socials}
          username={username}
          onChange={setSocial}
          errors={formState.errors}
        />

        <label className="form-label fw700 dark-color mb0">
          Δείγμα εργασιών
        </label>
        <ServiceGallery
          isPending={false}
          custom
          images={portfolio}
          onChange={setPortfolio}
        />

        <label className="form-label fw700 dark-color mb10">
          Εμφάνιση στο προφίλ
        </label>
        <div className="row">
          <div className="col-md-1">
            <SwitchB
              label="Email"
              name="visibility_email"
              initialValue={visibility.email}
              onChange={() =>
                setVisibility({
                  ...visibility,
                  email: !visibility.email,
                })
              }
            />
          </div>
          <div className="col-md-1">
            <SwitchB
              label="Τηλέφωνο"
              name="visibility_phone"
              initialValue={visibility.phone}
              onChange={() =>
                setVisibility({
                  ...visibility,
                  phone: !visibility.phone,
                })
              }
            />
          </div>
          <div className="col-md-1">
            <SwitchB
              label="Διεύθυνση"
              name="visibility_address"
              initialValue={visibility.address}
              onChange={() =>
                setVisibility({
                  ...visibility,
                  address: !visibility.address,
                })
              }
            />
          </div>
        </div>

        <SaveButton isPending={isPending} hasChanges={hasChanges()} />
        {formState.errors.submit && (
          <div className="mt10 text-error">{formState.errors.submit}</div>
        )}
        {formState.message && !formState.errors.submit && (
          <div className="mt10 text-success">{formState.message}</div>
        )}
      </div>
    </form>
  );
}
