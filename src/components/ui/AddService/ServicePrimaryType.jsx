"use client";

import React from "react";
import useCreateServiceStore from "@/store/service/createServiceStore";

export default function ServicePrimaryType({ coverage }) {
  const { type, setType } = useCreateServiceStore();

  return (
    <div className="pt20">
      <h4 className="list-title pb10">
        Προσφέρετε την υπηρεσία, <br /> online ή με την φυσική σας παρουσία?
      </h4>
      {!coverage.onbase && !coverage.onsite && (
        <p className="pb10 text-danger">
          Δεν μπορείτε να επιλέξετε "Φυσική παρουσία"
          <br /> γιατί δεν έχετε συμπληρώσει την Περιοχή και την Διεύθυνση ή τις
          Περιοχές Εξυπηρέτησης στο προφίλ σας.
        </p>
      )}
      <div className="mb20-lg mt20 mb30">
        <button
          className={`ud-btn btn-thm2 add-joining mr10-lg mr20 ${
            type.online ? "active" : ""
          }`}
          type="button"
          onClick={() => setType("online")}
        >
          Online
        </button>

        <button
          className={`ud-btn btn-thm2 add-joining ${
            type.presence ? "active" : ""
          }`}
          type="button"
          onClick={() => setType("presence")}
          disabled={!coverage.onbase && !coverage.onsite}
        >
          Φυσική Παρουσία
        </button>
      </div>
    </div>
  );
}
