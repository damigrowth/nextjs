"use client";

import InputB from "@/components/inputs/InputB";
import useCreateServiceStore from "@/store/service/create/createServiceStore";
import React from "react";

export default function FeaturesListEdit({ index }) {
  const {
    newFeature,
    editingFeature,
    errors,
    cancelEditingFeature,
    saveEditingFeature,
    handleEditingFeatureChange,
  } = useCreateServiceStore();

  return (
    <tr>
      <td colSpan="10" className="table-editing-bg">
        <h5 className="table-editing-bg ml30 p0">Επεξεργασία παροχής</h5>
        <div className="table-editing-bg p0 mt30">
          <div className="px30">
            <div className="row">
              <div className="col-sm-6 table-editing-bg">
                <InputB
                  label="Αλλαγή παροχής"
                  type="text"
                  id="editing-feature-title"
                  name="editing-feature-title"
                  value={editingFeature.title}
                  placeholder={editingFeature.title}
                  maxLength={20}
                  onChange={(formattedValue) =>
                    handleEditingFeatureChange("title", formattedValue)
                  }
                  className="form-control input-group"
                  errors={errors}
                  formatSymbols
                  capitalize
                />
              </div>
              <div className="col-sm-6 table-editing-bg">
                {editingFeature.isCheckField ? (
                  <div>
                    <label
                      htmlFor={`editingFeature.checked`}
                      className="form-label fw500 dark-color"
                    >
                      Αλλαγή επιλογής
                    </label>
                    <div className="radio-element">
                      <div className="form-check form-check-inline ">
                        <label htmlFor={`editingFeature.checkedTrue-${index}`}>
                          Ναι
                        </label>
                        <input
                          type="radio"
                          id={`editingFeature.checkedTrue-${index}`}
                          name={`editingFeature.checked`}
                          value={true}
                          checked={editingFeature.checked === true}
                          onChange={(e) =>
                            handleEditingFeatureChange("checked", true)
                          }
                          className="form-check-input"
                        />
                      </div>
                      <div className="form-check form-check-inline">
                        <label htmlFor={`editingFeature.checkedFalse-${index}`}>
                          Όχι
                        </label>
                        <input
                          type="radio"
                          id={`editingFeature.checkedFalse-${index}`}
                          name={`editingFeature.checked`}
                          value={false}
                          checked={editingFeature.checked === false}
                          onChange={(e) =>
                            handleEditingFeatureChange("checked", false)
                          }
                          className="form-check-input"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <InputB
                    label="Αλλαγή κειμένου"
                    type="text"
                    id="editing-feature-value"
                    name="editing-feature-value"
                    maxLength={10}
                    value={editingFeature.value}
                    onChange={(formattedValue) =>
                      handleEditingFeatureChange("value", formattedValue)
                    }
                    className="form-control input-group"
                    errors={errors}
                    formatSymbols
                    capitalize
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="table-editing-bg p0 mt30">
          <div className="px30">
            <div className="row">
              <div className="col-sm-6 text-start pb-4">
                <button
                  type="button"
                  onClick={cancelEditingFeature}
                  className="ud-btn btn-dark-border"
                >
                  Ακύρωση
                </button>
              </div>
              <div className="col-sm-6 text-end pb-4">
                <button
                  type="button"
                  onClick={saveEditingFeature}
                  className="ud-btn btn-thm"
                >
                  Αποθήκευση
                </button>
              </div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}
