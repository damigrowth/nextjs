"use client";

import InputB from "@/components/inputs/InputB";
import TextArea from "@/components/inputs/TextArea";
import useCreateServiceStore from "@/store/service/createServiceStore";
import React from "react";

export default function NewAddonInputs() {
  const { newAddon, setNewAddon, clearNewAddon, saveNewAddon, errors } =
    useCreateServiceStore();

  // console.log("ERRORS", errors);
  // console.log("newAddon", newAddon);

  return (
    <>
      <div className="mt20">
        <div className="bdrs4 p30">
          <div className="row">
            <div className="col-sm-9">
              <div className="mb20 form-group">
                <InputB
                  label="Τίτλος"
                  type="text"
                  id="addon-title"
                  name="addon-title"
                  maxLength={40}
                  value={newAddon.title}
                  onChange={(formattedValue) =>
                    setNewAddon("title", formattedValue)
                  }
                  className="form-control input-group"
                  errors={errors}
                  formatNumbers
                  formatSymbols
                  capitalize
                />
              </div>
            </div>
            <div className="col-sm-3">
              <div className="mb20 form-group">
                <InputB
                  label="Τιμή"
                  type="number"
                  id="addon-price"
                  name="addon-price"
                  min={5}
                  max={1000}
                  value={newAddon.price}
                  onChange={(formattedValue) =>
                    setNewAddon("price", formattedValue)
                  }
                  className="form-control input-group"
                  errors={errors}
                  append="€"
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="mb20">
              <TextArea
                label="Περιγραφή"
                id="addon-description"
                name="addon-description"
                rows={1}
                minLength={5}
                maxLength={80}
                value={newAddon.description}
                onChange={(formattedValue) =>
                  setNewAddon("description", formattedValue)
                }
                errors={errors}
                capitalize
                formatSymbols
                counter
              />
            </div>
          </div>
          {errors.field === "addons" ? (
            <div>
              <p className="text-danger">{errors.message}</p>
            </div>
          ) : null}

          <div className="row pt20 ">
            <div className="col-sm-6 text-start">
              <button
                type="button"
                onClick={clearNewAddon}
                className="ud-btn btn-dark-border  "
              >
                Ακύρωση
              </button>
            </div>
            <div className="col-sm-6 text-end">
              <button
                type="button"
                onClick={saveNewAddon}
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
