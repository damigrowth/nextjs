"use client";

import InputB from "@/components/inputs/InputB";
import TextArea from "@/components/inputs/TextArea";
import useCreateServiceStore from "@/store/service/createServiceStore";
import React from "react";

export default function AddonsListEdit({ index }) {
  const {
    newAddon,
    editingAddon,
    errors,
    cancelEditingAddon,
    saveEditingAddon,
    setEditingAddon,
  } = useCreateServiceStore();

  // console.log("errors", errors);

  return (
    <tr>
      <td colSpan="10" className="table-editing-bg">
        <h5 className="table-editing-bg ml30 p0">Επεξεργασία παροχής</h5>
        <div className="table-editing-bg p0 mt30">
          <div className="px30">
            <div className="row pb10">
              <div className="col-sm-9 table-editing-bg">
                <InputB
                  label="Αλλαγή Τίτλου"
                  type="text"
                  id="editing-addon-title"
                  name="editing-addon-title"
                  value={editingAddon.title}
                  placeholder={editingAddon.title}
                  maxLength={20}
                  onChange={(formattedValue) =>
                    setEditingAddon("title", formattedValue)
                  }
                  className="form-control input-group"
                  errors={errors}
                  formatSymbols
                  capitalize
                />
              </div>
              <div className="col-sm-3 table-editing-bg">
                <InputB
                  label="Αλλαγή Τιμής"
                  type="number"
                  id="editing-addon-price"
                  name="editing-addon-price"
                  min={5}
                  max={1000}
                  value={editingAddon.price}
                  onChange={(formattedValue) =>
                    setEditingAddon("price", formattedValue)
                  }
                  className="form-control input-group"
                  errors={errors}
                  append="€"
                />
              </div>
            </div>
            <div className="row">
              <TextArea
                label="Αλλαγή Περιγραφής"
                id="editing-addon-description"
                name="editing-addon-description"
                rows={1}
                minLength={5}
                maxLength={80}
                value={editingAddon.description}
                onChange={(formattedValue) =>
                  setEditingAddon("description", formattedValue)
                }
                errors={errors}
                capitalize
                formatSymbols
                formatNumbers
                counter
              />
            </div>
          </div>
        </div>
        <div className="table-editing-bg p0 mt30">
          <div className="px30">
            <div className="row">
              <div className="col-sm-6 text-start">
                <button
                  type="button"
                  onClick={cancelEditingAddon}
                  className="ud-btn btn-dark-border"
                >
                  Ακύρωση
                </button>
              </div>
              <div className="col-sm-6 text-end">
                <button
                  type="button"
                  onClick={saveEditingAddon}
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
