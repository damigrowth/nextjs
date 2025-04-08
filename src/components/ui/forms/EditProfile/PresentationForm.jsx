"use client";

import { startTransition, useActionState, useRef } from "react";
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
import { uploadData } from "@/lib/uploads/upload";

export default function PresentationForm({ freelancer, jwt }) {
  const {
    website,
    setWebsite,
    visibility,
    setVisibility,
    socials,
    setSocial,
    viber, // Import viber
    setViber, // Import setViber
    whatsapp, // Import whatsapp
    setWhatsapp, // Import setWhatsapp
  } = useEditProfileStore();

  const initialState = {
    data: null,
    errors: {},
    message: null,
  };

  // Track if we've processed a successful form submission to avoid loops
  const hasProcessedSuccess = useRef(false);

  const [formState, formAction, isPending] = useActionState(
    updatePresentationInfo,
    initialState
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Setup original values for change detection
  const originalValues = {
    website: freelancer.website || "",
    visibility: freelancer.visibility || {
      phone: false,
      email: false,
      address: false,
    },
    socials: freelancer.socials || {
      facebook: null,
      linkedin: null,
      x: null,
      youtube: null,
      github: null,
      instagram: null,
      behance: null,
      dribbble: null,
    },
    viber: freelancer.viber || null, // Add viber
    whatsapp: freelancer.whatsapp || null, // Add whatsapp
  };

  // Setup current values for change detection
  const currentValues = {
    website,
    visibility,
    socials,
    viber, // Add viber
    whatsapp, // Add whatsapp
  };

  // Use the useFormChanges hook for form field changes
  const { changes, hasChanges: formFieldsChanged } = useFormChanges(
    currentValues,
    originalValues
  );

  // Track original media length for comparison
  const originalMediaLength = useRef(freelancer.portfolio?.data?.length || 0);

  // Media changes state
  const [mediaState, setMediaState] = useState({
    media: freelancer.portfolio?.data || [],
    deletedMediaIds: [],
    hasChanges: false,
    initialMediaIds: (freelancer.portfolio?.data || [])
      .map((item) => item.id)
      .filter(Boolean),
  });

  // Process social media errors for easier display
  const getSocialErrors = () => {
    const errors = {};
    if (formState?.errors?.socials) {
      Object.entries(formState.errors.socials).forEach(([platform, value]) => {
        if (value && value.url && value.url.message) {
          errors[platform] = { message: value.url.message };
        } else if (value && value.message) {
          errors[platform] = { message: value.message };
        }
      });
    }
    return errors;
  };

  const socialErrors = getSocialErrors();

  // Reset form state when component mounts or unmounts
  useEffect(() => {
    // Reset processing flag when component unmounts
    return () => {
      hasProcessedSuccess.current = false;
    };
  }, []);

  // Reset media changes flag after successful submission - using a different approach
  useEffect(() => {
    // Only run this if we have a success message and no errors
    const isSuccess = formState?.message && !formState?.errors;

    // Only process a success once to avoid loops
    if (isSuccess && !hasProcessedSuccess.current) {
      // Mark that we've processed this success
      hasProcessedSuccess.current = true;

      // Reset the MediaGallery user action flag first
      if (typeof window !== "undefined") {
        document.dispatchEvent(new CustomEvent("media-gallery-reset"));

        // Use setTimeout to break potential render cycles
        setTimeout(() => {
          // Get the updated media from portfolio after server response
          const updatedMedia = freelancer.portfolio?.data || [];

          // Update state after userActionPerformed is reset
          setMediaState((prev) => {
            // Compare if the media actually changed to avoid unnecessary updates
            if (
              compareMediaArrays(prev.media, updatedMedia) &&
              prev.deletedMediaIds.length === 0 &&
              !prev.hasChanges
            ) {
              return prev;
            }

            return {
              media: updatedMedia,
              deletedMediaIds: [],
              hasChanges: false,
              initialMediaIds: updatedMedia
                .map((item) => item.id)
                .filter(Boolean),
            };
          });

          // Update the original length reference
          originalMediaLength.current = updatedMedia.length;
        }, 20); // A slightly longer delay to ensure the reset event has been processed
      }
    } else if (!isSuccess) {
      // Reset our tracker if form state is not a success
      hasProcessedSuccess.current = false;
    }
  }, [formState]);

  // Handle media changes through the proper update function
  const handleMediaUpdate = (media, deletedIds) => {
    // Ensure we're only updating state when necessary
    setMediaState((prev) => {
      // Combine previous and new deleted IDs without duplicates
      const combinedDeletedIds = Array.from(
        new Set([...prev.deletedMediaIds, ...deletedIds])
      );

      // Debug deleted IDs handling

      // Deep compare media arrays to detect real changes
      const mediaContentChanged = !compareMediaArrays(prev.media, media);
      // Deep compare deleted IDs arrays
      const deletedIdsContentChanged = !arraysEqual(
        prev.deletedMediaIds,
        combinedDeletedIds
      );

      // Skip update if nothing has actually changed
      if (!mediaContentChanged && !deletedIdsContentChanged) {
        return prev;
      }

      // Check if there are new files or deleted files
      const hasNewFiles = media.some((item) => item.file instanceof File);
      const hasDeletedFiles = combinedDeletedIds.length > 0;
      const hasLengthChanged = media.length !== originalMediaLength.current;

      // Check if we've returned to the original state
      const isInitialState =
        media.length === 0 &&
        originalMediaLength.current === 0 &&
        !hasDeletedFiles;

      // Calculate the new hasChanges value
      const newHasChanges = isInitialState
        ? false
        : hasNewFiles || hasDeletedFiles || hasLengthChanged;

      // Return new state with the updated values
      return {
        ...prev,
        media,
        deletedMediaIds: combinedDeletedIds,
        hasChanges: newHasChanges,
      };
    });
  };

  // Helper function to compare media arrays
  const compareMediaArrays = (arr1, arr2) => {
    if (arr1.length !== arr2.length) return false;

    // Create hashable representations of media items
    const getMediaHash = (item) => {
      if (typeof window !== "undefined" && item.file instanceof File) {
        return `file_${item.file.name}_${item.file.size}`;
      } else if (
        item.file &&
        typeof item.file === "object" &&
        "id" in item.file
      ) {
        return `id_${item.file.id}`;
      }
      return JSON.stringify(item);
    };

    // Convert arrays to hashable strings for comparison
    const set1 = new Set(arr1.map(getMediaHash));
    const set2 = new Set(arr2.map(getMediaHash));

    // Check if all items in set2 are in set1
    return arr2.every((item) => set1.has(getMediaHash(item)));
  };

  // Helper function to compare arrays of primitives
  const arraysEqual = (a, b) => {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, idx) => val === sortedB[idx]);
  };

  // Handle media save - implemented to set changes flag
  const handleMediaSave = async (media, deletedIds) => {
    handleMediaUpdate(media, deletedIds);
    return true; // Indicate successful operation to MediaGallery component
  };

  // Combine form field changes with media changes
  const hasChanges = () => {
    const formHasChanges = formFieldsChanged;

    // Check if media has changes
    const mediaHasChanges = mediaState.hasChanges;

    // Explicitly check for deleted media as an indication of changes
    const hasDeletedMedia = mediaState.deletedMediaIds.length > 0;

    // Check if we're at the initial state (no files when there were none originally)
    const hasReturnedToInitialState =
      mediaState.media.length === 0 &&
      originalMediaLength.current === 0 &&
      mediaState.deletedMediaIds.length === 0;

    // Check if all media has been deleted (special case)
    const allMediaDeleted =
      mediaState.media.length === 0 && originalMediaLength.current > 0;

    // If we've returned to the initial state, we don't have changes
    if (hasReturnedToInitialState) {
      return formHasChanges;
    }

    // If all media has been deleted, this is definitely a change
    if (allMediaDeleted) {
      return true;
    }

    return formHasChanges || mediaHasChanges || hasDeletedMedia;
  };

  // Handle form submission
  // Updated handleSubmit function for PresentationForm
  const handleSubmit = async (formData) => {
    // Set loading state
    setIsSubmitting(true);

    // Only proceed if there are changes
    if (!hasChanges()) {
      setIsSubmitting(false);
      return;
    }

    try {
      // Step 1: Validate the form first
      const validationFormData = new FormData();
      validationFormData.append("id", freelancer.id);
      validationFormData.append("validateOnly", "true");

      // Create validation state to check before proceeding
      const formChangesToValidate = {};
      if (changes.website !== undefined)
        formChangesToValidate.website = changes.website;
      if (changes.visibility)
        formChangesToValidate.visibility = changes.visibility;
      if (changes.socials) formChangesToValidate.socials = changes.socials;
      if (changes.viber !== undefined)
        formChangesToValidate.viber = changes.viber; // Add viber
      if (changes.whatsapp !== undefined)
        formChangesToValidate.whatsapp = changes.whatsapp; // Add whatsapp

      // Add media validation state
      const mediaValidationState = {
        hasNewMedia: mediaState.media.some((item) => item.file instanceof File),
        hasDeletedMedia: mediaState.deletedMediaIds.length > 0,
        mediaCount: mediaState.media.length,
      };

      validationFormData.append(
        "changes",
        JSON.stringify(formChangesToValidate)
      );
      validationFormData.append(
        "mediaState",
        JSON.stringify(mediaValidationState)
      );

      // Call server action WITH await to ensure validation completes
      const validationResult = await formAction(validationFormData);

      // Check validation result
      if (
        validationResult?.errors &&
        Object.keys(validationResult.errors).length > 0
      ) {
        console.log("Validation failed:", validationResult.errors);
        setIsSubmitting(false);
        return; // Stop the submission if validation fails
      }

      // Step 2: If validation passed, handle file uploads
      let newMediaIds = [];
      const newFiles = mediaState.media
        .filter((item) => item.file && item.file instanceof File)
        .map((item) => item.file);

      // If we have new files, upload them
      if (newFiles.length > 0) {
        const mediaOptions = {
          refId: freelancer.id,
          ref: "api::freelancer.freelancer",
          field: "portfolio",
        };

        try {
          // Upload files using the uploadData function
          newMediaIds = await uploadData(newFiles, mediaOptions, jwt);

          // Handle case where upload fails but no error is thrown
          if (!newMediaIds.length && newFiles.length > 0) {
            throw new Error("Failed to upload media files");
          }
        } catch (error) {
          // Handle upload error
          setIsSubmitting(false);

          // Create error form data
          const errorFormData = new FormData();
          errorFormData.append("id", freelancer.id);
          errorFormData.append(
            "error",
            JSON.stringify({
              message: "Σφάλμα κατά την μεταφόρτωση των αρχείων",
            })
          );

          // Submit error
          await formAction(errorFormData);
          return;
        }
      }

      // Step 3: Prepare final submission
      const finalFormData = new FormData();
      finalFormData.append("id", freelancer.id);

      // Only include fields that have actually changed
      const formChanges = {};
      if (changes.website !== undefined) formChanges.website = changes.website;
      if (changes.visibility) formChanges.visibility = changes.visibility;
      if (changes.socials) formChanges.socials = changes.socials;
      if (changes.viber !== undefined) formChanges.viber = changes.viber; // Add viber
      if (changes.whatsapp !== undefined)
        formChanges.whatsapp = changes.whatsapp; // Add whatsapp

      finalFormData.append("changes", JSON.stringify(formChanges));

      // Prepare remaining media IDs (existing media that wasn't deleted)
      const remainingMediaIds = mediaState.media
        .filter(
          (item) =>
            item.file && typeof item.file === "object" && "id" in item.file
        )
        .map((item) => item.file.id);

      // Combine existing and new media IDs
      const allMediaIds = [...remainingMediaIds, ...newMediaIds];

      // Handle media information
      const hasMediaDeletions = mediaState.deletedMediaIds.length > 0;
      const allMediaDeleted =
        mediaState.media.length === 0 && originalMediaLength.current > 0;

      if (mediaState.hasChanges || hasMediaDeletions || allMediaDeleted) {
        // Instead of appending files, just append the IDs
        finalFormData.append("remaining-media", JSON.stringify(allMediaIds));
        finalFormData.append(
          "deleted-media",
          JSON.stringify(mediaState.deletedMediaIds)
        );

        // For the special case where all media is deleted
        if (allMediaDeleted) {
          finalFormData.append("all-media-deleted", "true");
        }
      }

      // Reset hasProcessedSuccess flag before submission
      hasProcessedSuccess.current = false;

      // Call the server action with transition for UI updates
      startTransition(() => {
        formAction(finalFormData);
      });
    } catch (error) {
      console.error("Submission error:", error);

      // Create error form data
      const errorFormData = new FormData();
      errorFormData.append("id", freelancer.id);
      errorFormData.append(
        "error",
        JSON.stringify({
          message: "Προέκυψε σφάλμα κατά την υποβολή",
        })
      );

      formAction(errorFormData);
    } finally {
      setIsSubmitting(false);
    }
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
              initialValue={visibility?.email || false}
              onChange={(checked) => setVisibility("email", checked)}
            />
          </div>
          <div className="col-md-2">
            <SwitchB
              label="Τηλέφωνο"
              name="visibility_phone"
              initialValue={visibility?.phone || false}
              onChange={(checked) => setVisibility("phone", checked)}
            />
          </div>
          <div className="col-md-2">
            <SwitchB
              label="Διεύθυνση"
              name="visibility_address"
              initialValue={visibility?.address || false}
              onChange={(checked) => setVisibility("address", checked)}
            />
          </div>
        </div>

        {/* Combine Website, Viber, Whatsapp into one row */}
        <div className="row mb40 mt40">
          <div className="col-md-3">
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
          <div className="col-md-3">
            <InputB
              label="Viber"
              id="viber"
              name="viber"
              type="tel"
              pattern="[0-9]*"
              inputMode="numeric"
              value={viber || ""}
              onChange={setViber}
              className="form-control input-group"
              errors={formState?.errors?.viber}
            />
          </div>
          <div className="col-md-3">
            <InputB
              label="Whatsapp"
              id="whatsapp"
              name="whatsapp"
              type="tel"
              pattern="[0-9]*"
              inputMode="numeric"
              value={whatsapp || ""}
              onChange={setWhatsapp}
              className="form-control input-group"
              errors={formState?.errors?.whatsapp}
            />
          </div>
        </div>
        {/* End combined row */}

        <label className="form-label fw700 dark-color">Κοινωνικά Δίκτυα</label>
        <SocialsInputs
          data={socials}
          username={freelancer.username}
          onChange={setSocial}
          errors={socialErrors}
        />

        <label className="form-label fw700 dark-color mb0">
          Δείγμα εργασιών
        </label>
        <MediaGallery
          initialMedia={freelancer.portfolio?.data || []}
          onUpdate={handleMediaUpdate}
          onSave={handleMediaSave}
          isPending={isSubmitting || isPending}
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
          isPending={isSubmitting || isPending}
          hasChanges={hasChanges()}
        />
      </div>
    </form>
  );
}
