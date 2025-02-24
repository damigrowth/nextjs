"use client";

import React, { useActionState } from "react";
import ServiceGallery from "../AddService/ServiceGallery";
import { createService } from "@/lib/service/create";
import ServiceFaq from "../ServiceFaq/ServiceFaq";
import ServiceInformation from "../ServiceInformation/ServiceInformation";
import useCreateServiceStore from "@/store/service/createServiceStore";
import ServiceSuccess from "../ServiceSuccess/ServiceSuccess";
import ServicePackages from "../AddService/ServicePackages";
import ServiceAddons from "../AddService/ServiceAddons";
import ServiceType from "../AddService/ServiceType";
import { NavigationButtons } from "../buttons/NavigationButtons";

function AddServiceButton({ isPending }) {
  return (
    <button
      disabled={isPending}
      className="ud-btn btn-dark default-box-shadow2"
    >
      {isPending ? "Δημοσίευση Υπηρεσίας..." : "Δημοσίευση Υπηρεσίας"}
      {isPending ? (
        <div className="spinner-border spinner-border-sm ml10" role="status">
          <span className="sr-only"></span>
        </div>
      ) : (
        <span className="pl10">🚀</span>
      )}
    </button>
  );
}

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
  } = useCreateServiceStore();

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

  const handleDisable = () => {
    if (optional[step]) {
      return false; // Not disabled if optional
    }
    return !saved[step]; // Disabled if not saved
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

  const handleNextButton = () => {
    setStep(steps[step].next);
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
            <NavigationButtons
              showPrevious={showPreviousButton()}
              onPreviousClick={handlePreviousButton}
              showNext={showNextButton()}
              onNextClick={handleNextButton}
              nextDisabled={handleDisable()}
              isPending={isPending}
            />
          </>
        )}
      </div>
    </form>
  );
}
