"use client";

import React from "react";
import useCreateServiceStore from "@/store/service/create/createServiceStore";

export default function ServiceSecondaryType({ coverage }) {
  const { type, setType, saveType } = useCreateServiceStore();

  const handleTypeChange = (currType) => {
    setType(currType);
    saveType();
  };

  return (
    <>
      {type.online && (
        <div className="pt20">
          <h4 className="list-title pb10">
            Προσφέρετε τη συγκεκριμένη υπηρεσία, <br /> με τη μορφή συνδρομής ή
            θα εκτελεστεί για μια φορά;
          </h4>
          <div className="mb20-lg mt20 mb30">
            <button
              className={`ud-btn btn-thm2 add-joining mr10-lg mr20 ${
                type.oneoff ? "active" : ""
              }`}
              type="button"
              onClick={() => handleTypeChange("oneoff")}
            >
              One-off
            </button>
            <button
              className={`ud-btn btn-thm2 add-joining ${
                type.subscription ? "active" : ""
              }`}
              type="button"
              onClick={() => handleTypeChange("subscription")}
            >
              Συνδρομή
            </button>
          </div>
        </div>
      )}
      {type.presence && (
        <div className="pt20">
          <h4 className="list-title pb10">
            Προσφέρετε τη συγκεκριμένη υπηρεσία, <br /> σε δικό σας χώρο ή στον
            χώρο του πελάτη;
          </h4>
          {!coverage.onbase && (
            <p className="pb10 text-danger">
              Δεν μπορείτε να επιλέξετε "Στην έδρα μου"
              <br /> γιατί δεν έχετε συμπληρώσει την Περιοχή και την Διεύθυνση
              στο προφίλ σας.
            </p>
          )}
          {!coverage.onsite && (
            <p className="pb10 text-danger">
              Δεν μπορείτε να επιλέξετε "Στον χώρο του πελάτη"
              <br /> γιατί δεν έχετε συμπληρώσει τις Περιοχές Εξυπηρέτησης στο
              προφίλ σας.
            </p>
          )}
          <div className="mb20-lg mb30">
            <button
              className={`ud-btn btn-thm2 add-joining mr10-lg mr20 ${
                type.onbase ? "active" : ""
              }`}
              type="button"
              onClick={() => handleTypeChange("onbase")}
              disabled={!coverage.onbase}
            >
              Στην έδρα μου
            </button>
            <button
              className={`ud-btn btn-thm2 add-joining ${
                type.onsite ? "active" : ""
              }`}
              type="button"
              onClick={() => handleTypeChange("onsite")}
              disabled={!coverage.onsite}
            >
              Στον χώρο του πελάτη
            </button>
          </div>
        </div>
      )}
    </>
  );
}
