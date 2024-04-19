"use client";

import React from "react";
import { useFormState, useFormStatus } from "react-dom";

import ServiceGallery from "../dashboard/section/ServiceGallery";
import { createService } from "@/lib/service/create";
import ServicePackages from "../dashboard/section/ServicePackages";
import ServiceAddons from "../dashboard/section/ServiceAddons";
import ServiceFaq from "../dashboard/section/ServiceFaq/ServiceFaq";
import ServiceInformation from "../dashboard/section/ServiceInformation/ServiceInformation";
import useCreateServiceStore from "@/store/service/createServiceStore";
import Buttons1 from "../ui-elements/Buttons1";

function AddServiceButton() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="ud-btn btn-dark default-box-shadow2">
      {pending ? "Δημοσίευση Υπηρεσίας..." : "Δημοσίευση"}{" "}
      <i className="fal fa-arrow-right-long" />
    </button>
  );
}

export default function AddServiceForm({ categories, skills, cities }) {
  const initialState = {
    errors: {},
    message: null,
  };

  const [formState, formAction] = useFormState(createService, initialState);

  const { service, saved, step, steps, setStep } = useCreateServiceStore();

  console.log("SERVICE", service);
  // console.log("FORMSTATE", errors);

  return (
    <form action={formAction}>
      <div className="row">
        <div className="col-lg-9">
          <div className="dashboard_title_area">
            <h2>Δημιουργία Υπηρεσίας</h2>
            <p className="text">
              Με αυτή την φόρμα μπορείτε να προσθέσετε καινούργιες υπηρεσίες.
            </p>
          </div>
        </div>
        <div className="col-lg-3">
          <div className="text-lg-end">
            <AddServiceButton />
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
        {/* {step === "info" && (
          <ServiceInformation categories={categories} skills={skills} />
        )}
        {step === "packages" && <ServicePackages />}
        {step === "addons" && <ServiceAddons />}
        {step === "faq" && <ServiceFaq />} */}
        {/* {step === "gallery" && <ServiceGallery />} */}
        <ServiceGallery />
      </div>
      <div className="row pt10 ">
        <div className="col-sm-6 text-start">
          {steps[step].previous ? (
            <button
              type="button"
              onClick={() => setStep(steps[step].previous)}
              className="ud-btn btn-white bdrs4 d-flex align-items-center gap-2 default-box-shadow p3"
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
              disabled={saved[step] === false}
              onClick={() => setStep(steps[step].next)}
              className={`ud-btn btn-dark bdrs4 d-flex justify-content-end align-items-center gap-2 default-box-shadow p3 ${
                saved[step] === false ? "btn-dark-disabled" : ""
              }`}
            >
              <span>Επόμενο</span>
              <span className="d-flex align-items-center flaticon-right fz20" />
            </button>
          ) : null}
        </div>
      </div>
    </form>
  );
}
