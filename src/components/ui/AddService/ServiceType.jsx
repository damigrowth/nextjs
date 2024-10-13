"use client";

import React from "react";
import ServicePrimaryType from "./ServicePrimaryType";
import ServiceSecondaryType from "./ServiceSecondaryType";
import useCreateServiceStore from "@/store/service/createServiceStore";

export default function ServiceType() {
  const { type, typeStep, goBack } = useCreateServiceStore();

  console.log(
    `🚀 ----------------------------------------------------------------------🚀`
  );
  console.log(`🚀 ~ file: ServiceType.jsx:9 ~ ServiceType ~ type:`, type);
  console.log(
    `🚀 ----------------------------------------------------------------------🚀`
  );

  return (
    <div className="ps-widget bgc-white bdrs12 p30 mb30 overflow-hidden position-relative">
      <div className="bdrb1">
        <h3 className="list-title pb5">Τύπος υπηρεσίας</h3>
      </div>
      {typeStep === 0 && <ServicePrimaryType />}
      {(typeStep === 1 || typeStep === 2) && <ServiceSecondaryType />}
      <div className="service-type-buttons">
        <button
          type="button"
          onClick={() => goBack()}
          className={`ud-btn btn-white bdrs4 d-flex align-items-center gap-2 default-box-shadow p3 ${
            (typeStep === 1 || typeStep === 2) && "visible"
          }`}
        >
          <span className="d-flex align-items-center flaticon-left fz20" />
          <span>Πίσω</span>
        </button>
        {/* {primaryType && secondaryType && ( */}
        <button
          type="button"
          className="ud-btn btn-thm no-rotate visible"
          disabled={typeStep === 0 || typeStep === 1}
          // onClick={saveAddons}
        >
          Αποθήκευση
          <i className="fa-solid fa-floppy-disk"></i>
        </button>
      </div>
    </div>
  );
}
