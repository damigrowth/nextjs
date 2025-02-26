"use client";

import InputB from "@/components/inputs/InputB";
import useCreateServiceStore from "@/store/service/create/createServiceStore";
import React from "react";

export default function NewFeatureInputs() {
  const {
    newFeature,
    handleNewFeatureChange,
    clearNewFeature,
    saveNewFeature,
    message,
    errors,
  } = useCreateServiceStore();

  // console.log("ERRORS", errors);
  // console.log("newFeature", newFeature);

  return (
    <>
      <div className="mt20">
        <div className="bdrs4 p30">
          <div className="col-sm-12">
            <div className="mb20 d-flex align-items-center">
              <label
                htmlFor="package-isCheckField"
                className="fw500 dark-color pr20"
              >
                Κείμενο ή Επιλογή
              </label>
              <div className="form-check form-switch switch-style1">
                <input
                  type="checkbox"
                  role="switch"
                  id="package-isCheckField"
                  name="package-isCheckField"
                  checked={newFeature.isCheckField}
                  onChange={(e) =>
                    handleNewFeatureChange("isCheckField", e.target.checked)
                  }
                  className="form-check-input"
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-6">
              <div className="mb20 form-group">
                <InputB
                  label="Παροχή"
                  type="text"
                  id="package-feature-title"
                  name="package-feature-title"
                  maxLength={20}
                  value={newFeature.title}
                  onChange={(formattedValue) =>
                    handleNewFeatureChange("title", formattedValue)
                  }
                  className="form-control input-group"
                  errors={errors}
                  formatNumbers
                  formatSymbols
                  capitalize
                />
              </div>
            </div>
            <div className="col-sm-6">
              <div className="mb20 form-group">
                {!newFeature.isCheckField && (
                  <InputB
                    label="Κείμενο"
                    type="text"
                    id="package-feature-value"
                    name="package-feature-value"
                    minLength={1}
                    maxLength={10}
                    value={newFeature.value}
                    onChange={(formattedValue) =>
                      handleNewFeatureChange("value", formattedValue)
                    }
                    className="form-control input-group"
                    errors={errors}
                    formatSymbols
                    capitalize
                  />
                )}

                {newFeature.isCheckField && (
                  <>
                    <label className="form-label fw500 dark-color">
                      Επιλογή
                    </label>
                    <div className=" radio-element">
                      <div className="form-check form-check-inline ">
                        <label htmlFor="package-checkedTrue">Ναι</label>
                        <input
                          type="radio"
                          id="package-checkedTrue"
                          name="package-checked"
                          value={true}
                          onChange={(e) =>
                            handleNewFeatureChange("checked", true)
                          }
                          className="form-check-input"
                        />
                      </div>
                      <div className="form-check form-check-inline">
                        <label htmlFor="package-checkedFalse">Όχι</label>
                        <input
                          type="radio"
                          id="package-checkedFalse"
                          name="package-checked"
                          value={false}
                          onChange={(e) =>
                            handleNewFeatureChange("checked", false)
                          }
                          className="form-check-input"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          {errors.field === "features" ? (
            <div>
              <p className="text-danger">{errors.message}</p>
            </div>
          ) : null}

          <div className="row pt20 ">
            <div className="col-md-6 text-start">
              <button
                type="button"
                onClick={clearNewFeature}
                className="ud-btn btn-dark-border  "
              >
                Ακύρωση
              </button>
            </div>
            <div className="col-md-6 text-end">
              <button
                type="button"
                onClick={saveNewFeature}
                className="ud-btn btn-thm "
              >
                Αποθήκευση
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
