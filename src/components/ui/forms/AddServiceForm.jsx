"use client";

import React, { useActionState, useState, useEffect } from "react";
import ServiceGallery from "../AddService/ServiceGallery";
import { createService } from "@/lib/service/create";
import ServiceFaq from "../ServiceFaq/ServiceFaq";
import ServiceInformation from "../ServiceInformation/ServiceInformation";
import useCreateServiceStore from "@/store/service/create/createServiceStore";
import ServiceSuccess from "../ServiceSuccess/ServiceSuccess";
import ServicePackages from "../AddService/ServicePackages";
import ServiceAddons from "../AddService/ServiceAddons";
import ServiceType from "../AddService/ServiceType";
import { NavigationButtons } from "../buttons/NavigationButtons";
import Alert from "../alerts/Alert";
import SaveButton from "../buttons/SaveButton";

export default function AddServiceForm({ coverage }) {
  const {
    service,
    saved,
    optional,
    step,
    steps,
    setStep,
    info,
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
          (info.fixed && (info.price < 10 || info.price > 50000))
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

      case "gallery":
        // Check if media is uploaded
        const { media } = useCreateServiceStore.getState();
        return media.length === 0;

      // For addons and faq, they're usually optional
      default:
        return false;
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
        case "addons":
          // Save addons
          saveAddons();
          success = true; // Always true as it's optional
          break;
        case "faq":
          // Save faq
          saveFaq();
          success = true; // Always true as it's optional
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

  const showPreviousButton = () => {
    // Show previous button if there's a previous step or if we're in the type step with typeStep > 0
    return steps[step].previous || (step === "type" && typeStep > 0);
  };

  const showNextButton = () => {
    return steps[step].next;
  };

  return (
    <form action={formAction}>
      <div className="row">
        <div className="col-lg-9">
          <div className="dashboard_title_area">
            {!serviceId && (
              <>
                <h2>Δημιουργία Υπηρεσίας</h2>
                <p className="text">
                  Με αυτή την φόρμα μπορείτε να προσθέσετε καινούργιες
                  υπηρεσίες.
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
            {step === "addons" && <ServiceAddons />}
            {step === "faq" && <ServiceFaq />}
            {step === "gallery" && <ServiceGallery isPending={isPending} />}

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
              isPending={isPending}
              defaultText="Δημοσίευση Υπηρεσίας"
              loadingText="Δημοσίευση Υπηρεσίας..."
              emoji="🚀"
              icon={null}
              orientation="center"
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
