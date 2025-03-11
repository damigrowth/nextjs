"use client";

import { useActionState } from "react";
import { updatePresentationInfo } from "@/lib/profile/update";
import SaveButton from "../../buttons/SaveButton";
import SocialsInputs from "./SocialsInputs";
import InputB from "@/components/inputs/InputB";
import SwitchB from "../../Archives/Inputs/SwitchB";
import Alert from "../../alerts/Alert";
import { useState, useEffect } from "react";
import useEditProfileStore from "@/store/dashboard/profile";
import MediaGallery from "@/components/inputs/MediaGallery";
import { useFormChanges } from "@/hook/useFormChanges";

export default function PresentationForm({ freelancer }) {
  const { website, setWebsite, visibility, setVisibility, socials, setSocial } =
    useEditProfileStore();

  const initialState = {
    data: null,
    errors: {},
    message: null,
  };

  const [formState, formAction, isPending] = useActionState(
    updatePresentationInfo,
    initialState
  );

  // Setup original values for change detection
  const originalValues = {
    website: freelancer.website,
    visibility: freelancer.visibility || {},
    socials: freelancer.socials || {},
  };

  // Setup current values for change detection
  const currentValues = {
    website,
    visibility,
    socials,
  };

  // Use the same useFormChanges hook as other forms
  const { changes, hasChanges: formFieldsChanged } = useFormChanges(
    currentValues,
    originalValues
  );

  // Media changes state
  const [mediaState, setMediaState] = useState({
    media: freelancer.portfolio?.data || [],
    deletedMediaIds: [],
    hasChanges: false,
  });

  // Reset media changes flag after successful submission
  useEffect(() => {
    if (formState?.message && !formState?.errors) {
      setMediaState((prev) => ({
        ...prev,
        hasChanges: false,
      }));
    }
  }, [formState?.message, formState?.errors]);

  // Handle media changes
  const handleMediaUpdate = (media, deletedIds) => {
    setMediaState({
      media,
      deletedMediaIds: deletedIds,
      hasChanges: true,
    });
  };

  // Combine form field changes with media changes
  const hasChanges = () => formFieldsChanged || mediaState.hasChanges;

  // Handle form submission
  const handleSubmit = async (formData) => {
    // Only proceed if there are changes
    if (!hasChanges()) return;

    // Append basic information
    formData.append("id", freelancer.id);
    formData.append("changes", JSON.stringify(changes));

    // Handle media files if there are changes
    if (mediaState.hasChanges) {
      // Append new files (safely)
      const newFiles = mediaState.media
        .filter((item) => item.file && item.file instanceof File)
        .map((item) => item.file);

      newFiles.forEach((file) => {
        formData.append("media-files", file);
      });

      // Get remaining media IDs (safely)
      const remainingMediaIds = mediaState.media
        .filter(
          (item) =>
            item.file && typeof item.file === "object" && "id" in item.file
        )
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
          errors={formState?.errors?.socials || {}}
        />

        <label className="form-label fw700 dark-color mb0">
          Δείγμα εργασιών
        </label>
        <MediaGallery
          initialMedia={freelancer.portfolio?.data || []}
          onUpdate={handleMediaUpdate}
          isPending={isPending}
          custom={true}
          maxSize={15}
          maxVideos={3}
          maxAudio={3}
        />

        {formState?.errors && formState?.errors?.submit && (
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
          variant="primary"
          orientation="end"
          isPending={isPending}
          hasChanges={hasChanges()}
        />
      </div>
    </form>
  );
}
