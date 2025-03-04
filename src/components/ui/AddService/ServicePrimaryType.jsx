"use client";

import React from "react";
import useCreateServiceStore from "@/store/service/create/createServiceStore";
import Alert from "../alerts/Alert";

export default function ServicePrimaryType({ coverage }) {
  const { type, setType } = useCreateServiceStore();

  return (
    <div className="pt20">
      <h4 className="list-title pb10">
        Προσφέρετε την υπηρεσία, <br /> online ή με την φυσική σας παρουσία?
      </h4>

      <div className="mb20-lg mt20 mb20">
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
      {!coverage.onbase && !coverage.onsite && (
        <Alert
          type="info"
          message={`Δεν μπορείτε να επιλέξετε "Φυσική παρουσία" γιατί δεν έχετε συμπληρώσει την Περιοχή και την Διεύθυνση ή τις
          Περιοχές Εξυπηρέτησης στο προφίλ σας. `}
        />
      )}
    </div>
  );
}
