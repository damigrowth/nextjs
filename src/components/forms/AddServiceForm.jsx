"use client";

import React, { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

import BasicInformation from "../dashboard/section/BasicInformation";
import ExtraService from "../dashboard/section/ExtraService";
import Input from "../inputs/Input";
import SelectInput from "../dashboard/option/SelectInput";
import SelectInputMultiple from "../dashboard/option/SelectInputMultiple";
import ServiceGallery from "../dashboard/section/ServiceGallery";
import TextArea from "../inputs/TextArea";
import { createService } from "@/lib/service/create";
import { useForm } from "react-hook-form";
import ServicePackages from "../dashboard/section/ServicePackages";
import ServiceAddons from "../dashboard/section/ServiceAddons";
import ServiceFaq from "../dashboard/section/ServiceFaq/ServiceFaq";
import ServiceInformation from "../dashboard/section/ServiceInformation/ServiceInformation";
import useInfoStore from "@/store/service/infoStore";
import useCreateServiceStore from "@/store/service/createServiceStore";

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

  const { service } = useCreateServiceStore();

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
        <ServiceInformation categories={categories} skills={skills} />
        <ServicePackages />
        <ServiceAddons />
        <ServiceFaq />
        <ServiceGallery />
      </div>
    </form>
  );
}
