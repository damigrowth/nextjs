"use client";

import React, {
  useActionState,
  useState,
  useEffect,
  startTransition,
} from "react";
import { flushSync } from "react-dom";
import ServiceGallery from "./ui/AddService/ServiceGallery";
import { createService } from "@/lib/service/create";
import ServiceFaq from "./ui/ServiceFaq/ServiceFaq";
import ServiceInformation from "./ui/ServiceInformation/ServiceInformation";
import useCreateServiceStore from "@/store/service/create/createServiceStore";
import ServiceSuccess from "./ui/ServiceSuccess/ServiceSuccess";
import ServicePackages from "./ui/AddService/ServicePackages";
import ServiceAddons from "./ui/AddService/ServiceAddons";
import ServiceType from "./ui/AddService/ServiceType";
import { NavigationButtons } from "./ui/buttons/NavigationButtons";
import Alert from "./ui/alerts/Alert";
import SaveButton from "./ui/buttons/SaveButton";
import { uploadData } from "@/lib/uploads/upload";

export default function AddServiceForm({ coverage, jwt }) {
  const {
    service,
    saved,
    optional,
    step,
    steps,
    setStep,
    info,
    showPrice,
    media,
    goBack,
    typeStep,
    saveType,
    saveInfo,
    savePackages,
    saveAddons,
    saveFaq,
    saveGallery,
    errors,
    resetAll,
  } = useCreateServiceStore();

  const [savingStep, setSavingStep] = useState(false);
  const [validationErrors, setValidationErrors] = useState(null);

  const initialState = {
    data: null,
    errors: {},
    message: null,
  };

  const [formState, formAction, isPending] = useActionState(
    createService,
    initialState
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const serviceId = formState?.data?.id;
  const serviceTitle = formState?.data?.attributes?.title;

  // Reset state on component mount and after successful submission
  useEffect(() => {
    // Reset when component mounts
    resetAll();

    // Reset when serviceId changes (successful submission)
    if (serviceId) {
      resetAll();
    }
  }, [resetAll, serviceId]);

  // Check if the current step form is valid without requiring it to be saved
  const handleDisable = () => {
    if (optional[step]) {
      return false; // Not disabled if optional
    }

    // For each step, check if required fields are filled
    switch (step) {
      case "type":
        // Check if type selection is complete (reached step 2)
        return typeStep !== 2;

      case "info":
        // Check if basic info is filled
        return (
          !info.title ||
          info.title.length < 10 ||
          !info.description ||
          info.description.length < 80 ||
          info.category.id === 0 ||
          info.subcategory.id === 0 ||
          info.subdivision.id === 0 ||
          (showPrice &&
            info.fixed &&
            (info.price < 10 || info.price > 50000)) ||
          (!showPrice && info.fixed && info.price !== 0)
        );

      case "packages":
        // If packages step is used, check basic package information
        if (!info.fixed) {
          const { packages } = useCreateServiceStore.getState();
          return (
            packages.basic.features.length < 4 ||
            !packages.basic.description ||
            !packages.standard.description ||
            !packages.premium.description
          );
        }
        return false;

      case "addonsFaq": // Combined step is optional
        return false;

      case "gallery":
        // Check if media is uploaded
        const { media } = useCreateServiceStore.getState();
        return media.length === 0;

      default:
        return false; // Default to not disabled
    }
  };

  const handlePreviousButton = () => {
    if (step === "type") {
      if (typeStep === 1 || typeStep === 2) {
        goBack();
      }
    } else {
      setStep(steps[step].previous);
    }
  };

  const handleSaveCurrentStep = async () => {
    setSavingStep(true);
    setValidationErrors(null);

    let success = false;

    try {
      // First, clear any existing errors
      useCreateServiceStore.setState((state) => ({
        ...state,
        errors: { active: false, field: "", message: "" },
      }));

      switch (step) {
        case "type":
          // Save type and validate
          saveType();
          success = !errors || !errors.active;
          break;
        case "info":
          // Save info and validate
          saveInfo();
          success = !errors || !errors.active;
          break;
        case "packages":
          // Save packages and validate
          savePackages();
          success = !errors || !errors.active;
          break;
        // case "addons": // This case is now redundant
        //   // Save addons
        //   saveAddons();
        //   success = true; // Always true as it's optional
        //   break;
        case "addonsFaq": // Combined step
          // Save addons and faq
          saveAddons();
          saveFaq();
          success = true; // Always true as both are optional
          break;
        case "gallery":
          // Save gallery and validate
          saveGallery();
          success = !errors || !errors.active;
          break;
        default:
          success = true;
      }

      // If there are errors after save attempt, record them
      const currentErrors = useCreateServiceStore.getState().errors;
      if (currentErrors && currentErrors.active) {
        setValidationErrors(currentErrors);
        success = false;
      }
    } catch (error) {
      console.error("Error saving step:", error);
      success = false;
    } finally {
      setSavingStep(false);
    }

    return success;
  };

  const handleNextButton = async () => {
    // First save the current step
    const success = await handleSaveCurrentStep();

    // Only proceed to next step if save was successful
    if (success) {
      setStep(steps[step].next);
    }
  };

  const handleSubmit = async (formData) => {
    const { media } = useCreateServiceStore.getState();

    // Force immediate state update
    flushSync(() => {
      setIsSubmitting(true);
    });

    try {
      // Upload media files if any
      let newMediaIds = [];
      if (media.length > 0) {
        // Extract all files that need to be uploaded
        const newFiles = media
          .filter((item) => item.file instanceof File)
          .map((item) => item.file);

        if (newFiles.length > 0) {
          const mediaOptions = {
            ref: "api::service.service",
            field: "media",
          };

          // Try to upload the files and get their IDs
          newMediaIds = await uploadData(newFiles, mediaOptions, jwt);

          // If we have files but no IDs returned, there was an upload error
          if (newMediaIds.length === 0 && newFiles.length > 0) {
            throw new Error("Failed to upload media files");
          }

          // Add media IDs to form data as JSON string
          formData.append("media-ids", JSON.stringify(newMediaIds));
        } else {
          // No files to upload, set empty array
          formData.append("media-ids", "[]");
        }
      } else {
        // No media at all, set empty array
        formData.append("media-ids", "[]");
      }

      // Call the server action
      startTransition(() => {
        formAction(formData);
      });
    } catch (error) {
      console.error("Error during form submission:", error);
      // Update form state with error
      useCreateServiceStore.setState((state) => ({
        ...state,
        errors: {
          active: true,
          field: "media",
          message:
            error.message ||
            "Σφάλμα κατά την μεταφόρτωση των αρχείων. Προσπαθήστε ξανά.",
        },
      }));
    } finally {
      // Always ensure we clear the submitting state
      setIsSubmitting(false);
    }
  };

  const showPreviousButton = () => {
    // Show previous button if there's a previous step or if we're in the type step with typeStep > 0
    return steps[step].previous || (step === "type" && typeStep > 0);
  };

  const showNextButton = () => {
    return steps[step].next;
  };

  return (
    <form action={handleSubmit}>
      <div className="row">
        <div className="col-lg-9">
          <div className="dashboard_title_area">
            {!serviceId && (
              <>
                <h2>Δημιουργία Υπηρεσίας</h2>
                <p className="text">
                  Με αυτήν τη φόρμα μπορείτε να προσθέσετε νέες υπηρεσίες.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="col-xl-12">
        <input
          type="text"
          name="service"
          id="service"
          value={JSON.stringify(service)}
          hidden
          readOnly
        />

        {step === "info" && <ServiceInformation />}
        {serviceId ? (
          <ServiceSuccess id={serviceId} title={serviceTitle} />
        ) : (
          <>
            {step === "type" && <ServiceType coverage={coverage} />}
            {step === "packages" && <ServicePackages />}
            {step === "addonsFaq" && ( // Render both for combined step
              <>
                <ServiceAddons />
                <ServiceFaq />
              </>
            )}
            {step === "gallery" && (
              <ServiceGallery isPending={isSubmitting || isPending} />
            )}

            {/* Display any errors */}
            {errors && errors.active && (
              <Alert message={errors.message} type="danger" />
            )}

            {/* Display validation errors from state */}
            {validationErrors && validationErrors.active && (
              <Alert message={validationErrors.message} type="danger" />
            )}

            {/* Display form submission errors */}
            {formState.errors && (
              <Alert message={formState.message} type="danger" />
            )}

            <NavigationButtons
              showPrevious={showPreviousButton()}
              onPreviousClick={handlePreviousButton}
              showNext={showNextButton()}
              onNextClick={handleNextButton}
              nextDisabled={handleDisable()}
              isPending={savingStep || isPending}
            />

            <SaveButton
              isPending={isSubmitting || isPending}
              defaultText="Δημοσίευση Υπηρεσίας"
              loadingText="Δημοσίευση Υπηρεσίας..."
              emoji="🚀"
              icon={null}
              orientation="center"
              hasChanges={true}
              hidden={
                step !== "gallery" ||
                saved.type === false ||
                saved.info === false
              }
            />
          </>
        )}
      </div>
    </form>
  );
}
