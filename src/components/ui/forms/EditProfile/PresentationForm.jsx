"use client";

import { useActionState } from "react";
import { updatePresentationInfo } from "@/lib/profile/update";
import SaveButton from "../../buttons/SaveButton";
import SocialsInputs from "./SocialsInputs";
import InputB from "@/components/inputs/InputB";
import SwitchB from "../../Archives/Inputs/SwitchB";
import Alert from "../../alerts/Alert";
import { useRef, useState, useEffect } from "react";
import useEditProfileStore from "@/store/dashboard/profile";
import {
  MediaProvider,
  MediaUpload,
  useMediaUpload,
} from "@/components/inputs/MediaUpload";

function PresentationFormContent({ freelancer }) {
  const { website, setWebsite, visibility, setVisibility, socials, setSocial } =
    useEditProfileStore();

  // Initialize reference values for change detection
  const initialValues = useRef({
    website: freelancer.website,
    socials: freelancer.socials || {},
    visibility: freelancer.visibility || {},
  });

  const initialState = {
    data: null,
    errors: {},
    message: null,
  };

  const [formState, formAction, isPending] = useActionState(
    updatePresentationInfo,
    initialState
  );

  // Media changes state
  const [mediaChanges, setMediaChanges] = useState(null);

  const { media, deletedMediaIds } = useMediaUpload();

  // Handle media changes
  const handleMediaChange = (media, changes, context) => {
    console.log("media", media);
    console.log("changes", changes);
    console.log("context", context);

    setMediaChanges(changes);
  };

  // Detect form changes
  const hasChanges = () => {
    const socialChanged =
      JSON.stringify(socials) !== JSON.stringify(initialValues.current.socials);
    const websiteChanged = website !== initialValues.current.website;
    const visibilityChanged =
      JSON.stringify(visibility) !==
      JSON.stringify(initialValues.current.visibility);

    // Explicitly check media changes
    const mediaHasChanges =
      mediaChanges?.hasChanges ||
      (mediaChanges?.deletedFiles && mediaChanges.deletedFiles.length > 0);

    return (
      socialChanged || websiteChanged || visibilityChanged || mediaHasChanges
    );
  };

  // Handle form submission
  const handleSubmit = async (formData) => {
    // Prepare changes object
    const changes = {};

    // Check and add website changes
    if (website !== freelancer.website) {
      changes.website = website;
    }

    // Check and add socials changes
    const changedSocials = Object.fromEntries(
      Object.entries(socials).filter(
        ([platform, socialData]) =>
          JSON.stringify(socialData) !==
          JSON.stringify(freelancer.socials?.[platform])
      )
    );
    if (Object.keys(changedSocials).length > 0) {
      changes.socials = changedSocials;
    }

    // Check and add visibility changes
    if (JSON.stringify(visibility) !== JSON.stringify(freelancer.visibility)) {
      changes.visibility = visibility;
    }

    // Only proceed if there are changes
    if (
      Object.keys(changes).length === 0 &&
      (!mediaChanges || !mediaChanges.hasChanges)
    ) {
      return;
    }

    // Append basic information
    formData.append("id", freelancer.id);
    formData.append("changes", JSON.stringify(changes));

    // Prepare media information
    if (mediaChanges?.hasChanges) {
      // Append new files
      const validNewFiles = mediaChanges.newFiles.filter(
        (file) => file.size > 0 && file.name !== "undefined"
      );

      validNewFiles.forEach((file) => {
        formData.append("media-files", file);
      });

      // Get remaining media IDs
      const remainingMediaIds = media
        .filter((item) => item.file.attributes)
        .map((item) => item.file.id);

      formData.append("remaining-media", JSON.stringify(remainingMediaIds));
      formData.append("deleted-media", JSON.stringify(deletedMediaIds));
    }

    return formAction(formData);
  };

  // Reset media when freelancer portfolio changes
  useEffect(() => {
    // This effect ensures that if the freelancer's portfolio changes,
    // the media state is reset
    setMediaChanges(null);
  }, [freelancer.portfolio?.data]);

  return (
    <form action={handleSubmit}>
      <div className="form-style1">
        <div className="bdrb1 pb15 mb25">
          <h5 className="list-title heading">Παρουσίαση</h5>
        </div>

        <div className="mb10 col-md-3">
          <InputB
            label="Ιστότοπος"
            id="website"
            name="website"
            type="url"
            value={website}
            onChange={setWebsite}
            className="form-control input-group"
            errors={formState?.errors?.website}
          />
        </div>

        <label className="form-label fw700 dark-color">Κοινωνικά Δίκτυα</label>
        <SocialsInputs
          data={socials}
          username={freelancer.username}
          onChange={setSocial}
          errors={formState?.errors}
        />

        <label className="form-label fw700 dark-color mb0">
          Δείγμα εργασιών
        </label>
        <MediaUpload
          context="presentation"
          onMediaChange={handleMediaChange}
          isPending={isPending}
        />

        <label className="form-label fw700 dark-color mb10">
          Εμφάνιση στο προφίλ
        </label>
        <div className="row">
          <div className="col-md-2">
            <SwitchB
              label="Email"
              name="visibility_email"
              initialValue={visibility.email}
              onChange={(checked) => setVisibility("email", checked)}
            />
          </div>
          <div className="col-md-2">
            <SwitchB
              label="Τηλέφωνο"
              name="visibility_phone"
              initialValue={visibility.phone}
              onChange={(checked) => setVisibility("phone", checked)}
            />
          </div>
          <div className="col-md-2">
            <SwitchB
              label="Διεύθυνση"
              name="visibility_address"
              initialValue={visibility.address}
              onChange={(checked) => setVisibility("address", checked)}
            />
          </div>
        </div>

        {formState?.errors && (
          <Alert
            type="error"
            message={formState.errors?.submit}
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

export default function PresentationForm({ freelancer }) {
  return (
    <MediaProvider initialMedia={freelancer.portfolio?.data || []}>
      <PresentationFormContent freelancer={freelancer} />
    </MediaProvider>
  );
}
