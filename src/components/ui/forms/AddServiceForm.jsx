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
  const { service, saved, optional, step, steps, setStep, info, media } =
    useCreateServiceStore();

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
        {/* <ServiceInformation />
        <AddServiceButton isPending={isPending} /> */}
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
            <div className="row pt10 ">
              <div className="col-sm-6 text-start">
                {steps[step].previous ? (
                  <button
                    type="button"
                    onClick={() => setStep(steps[step].previous)}
                    className="ud-btn btn-white bdrs4 d-flex align-items-center gap-2 default-box-shadow p3"
                    disabled={isPending}
                  >
                    <span className="d-flex align-items-center flaticon-left fz20" />
                    <span>Πίσω</span>
                  </button>
                ) : null}
              </div>
              <div className="col-sm-6 text-end d-flex justify-content-end align-items-center">
                {steps[step].next ? (
                  <button
                    type="button"
                    disabled={handleDisable()}
                    onClick={() => setStep(steps[step].next)}
                    className={`ud-btn btn-dark bdrs4 d-flex justify-content-end align-items-center gap-2 default-box-shadow p3 ${
                      handleDisable() ? "btn-dark-disabled" : ""
                    }`}
                  >
                    <span>Επόμενο</span>
                    <span className="d-flex align-items-center flaticon-right fz20" />
                  </button>
                ) : null}
              </div>
              {saved.gallery === true && (
                <div className="d-flex justify-content-center">
                  <div className="text-center">
                    {formState.errors && (
                      <div className="mb10">
                        <p className="text-danger">{formState.message}</p>
                      </div>
                    )}
                    <AddServiceButton isPending={isPending} />
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </form>
  );
}
