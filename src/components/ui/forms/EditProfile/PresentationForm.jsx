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
import MediaGallery from "@/components/inputs/MediaGallery";

export default function PresentationForm({ freelancer }) {
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
  const [mediaState, setMediaState] = useState({
    media: freelancer.portfolio?.data || [],
    deletedMediaIds: [],
    hasChanges: false,
  });

  // Handle media changes
  const handleMediaUpdate = (media, deletedIds) => {
    setMediaState({
      media,
      deletedMediaIds: deletedIds,
      hasChanges: true,
    });
  };

  // Handle media save
  const handleMediaSave = async (media, deletedIds) => {
    // Reset the hasChanges flag after successful save
    setMediaState((prev) => ({
      ...prev,
      hasChanges: false,
    }));
  };

  // Detect form changes
  const hasChanges = () => {
    const socialChanged =
      JSON.stringify(socials) !== JSON.stringify(initialValues.current.socials);
    const websiteChanged = website !== initialValues.current.website;
    const visibilityChanged =
      JSON.stringify(visibility) !==
      JSON.stringify(initialValues.current.visibility);

    // Include media changes in the overall form changes
    return (
      socialChanged ||
      websiteChanged ||
      visibilityChanged ||
      mediaState.hasChanges
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
    if (Object.keys(changes).length === 0 && !mediaState.hasChanges) {
      return;
    }

    // Append basic information
    formData.append("id", freelancer.id);
    formData.append("changes", JSON.stringify(changes));

    // Prepare media information
    if (mediaState.hasChanges) {
      // Append new files
      const newFiles = mediaState.media.filter(
        (item) => item.file instanceof File
      );

      newFiles.forEach((item) => {
        formData.append("media-files", item.file);
      });

      // Get remaining media IDs
      const remainingMediaIds = mediaState.media
        .filter((item) => item.file.attributes)
        .map((item) => item.file.id);

      formData.append("remaining-media", JSON.stringify(remainingMediaIds));
      formData.append(
        "deleted-media",
        JSON.stringify(mediaState.deletedMediaIds)
      );
    }

    return formAction(formData);
  };

  return (
    <form action={handleSubmit}>
      <div className="form-style1">
        <div className="bdrb1 pb15 mb25">
          <h5 className="list-title heading">Παρουσίαση</h5>
        </div>
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

        <div className="mb10 col-md-3">
          <InputB
            label="Ιστότοπος"
            id="website"
            name="website"
            type="url"
            placeholder="https://selida.gr"
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
        <MediaGallery
          initialMedia={freelancer.portfolio?.data || []}
          onUpdate={handleMediaUpdate}
          onSave={handleMediaSave}
          isPending={isPending}
          custom={true}
          maxSize={15}
          maxVideos={3}
          maxAudio={3}
        />
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
          variant="primary"
          orientation="end"
          isPending={isPending}
          hasChanges={hasChanges()}
        />
      </div>
    </form>
  );
}
