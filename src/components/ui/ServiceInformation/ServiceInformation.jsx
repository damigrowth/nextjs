"use client";

import InputB from "@/components/inputs/InputB";
import TextArea from "@/components/inputs/TextArea";
import React, { useCallback, useEffect, useState } from "react";
import useCreateServiceStore from "@/store/service/createServiceStore";
import SelectInputSearch from "../../dashboard/option/SelectInputSearch";
import { useQuery } from "@apollo/client";

export default function ServiceInformation() {
  const { info, setInfo, saveInfo, errors, handleStepsTypeChange, type } =
    useCreateServiceStore();

  });

  // Fixed or Packages
  // const handlePriceTypeChange = (e) => {
  //   const isFixed = e.target.checked;
  //   setInfo("fixed", !isFixed);
  //   handleStepsTypeChange(!isFixed);
  // };

  const handleSubscriptionTypeChange = (e) => {
    const isYearly = e.target.checked;
    setInfo("subscription_type", isYearly ? "yearly" : "monthly");
  };

  const handleSearch = useCallback((field, term) => {
    setTaxonomyParams((prev) => ({ ...prev, [`${field}Term`]: term }));
  }, []);


  };

    })),
    })),
    })),
  };

  return (
    <div>
      <div className="ps-widget bgc-white bdrs4 p30 mb30 position-relative">
        <div className="bdrb1 pb15 mb25">
          <h3 className="list-title">Βασικές Πληροφορίες</h3>
        </div>
        <div className="form-style1">
          {/* <div className="row">
            <div className="mb20">
              <InputB
                label="Τίτλος"
                id="service-title"
                name="service-title"
                type="text"
                maxLength={80}
                value={info.title}
                onChange={(formattedValue) => setInfo("title", formattedValue)}
                className="form-control input-group"
                errors={errors}
                formatNumbers
                formatSymbols
                capitalize
              />
            </div>
          </div>
          <div className="row">
            <div className="mb10">
              <TextArea
                id="service-description"
                name="service-description"
                label="Περιγραφή"
                minLength={80}
                maxLength={5000}
                counter
                errors={errors}
                value={info.description}
                defaultValue={info.description}
                onChange={(formattedValue) =>
                  setInfo("description", formattedValue)
                }
              />
            </div>
          </div>
          <div className="row">
            <div className="col-sm-6">
              <div className="mb20">
                <SelectInputSearch
                  type="object"
                  id="service-category"
                  name="service-category"
                  label="Κατηγορία"
                  labelPlural="κατηγορίες"
                  query="category"
                  errors={errors}
                  isSearchable={true}
                  options={categoryOptions}
                  defaultValue={info.category.label}
                  onSelect={({ id, label }) =>
                    setInfo("category", { id, label })
                  }
                  capitalize
                />
              </div>
            </div>
            <div className="col-sm-6">
              <div className="mb20">
                <SelectInputSearch
                  options={tagOptions}
                  id="service-tags"
                  name="service-tags"
                  label="Χαρακτηριστικά"
                  labelPlural="χαρακτηριστικά"
                  errors={errors}
                  defaultValue={info.tags.map((tag) => ({
                    value: tag.id,
                    label: tag.label,
                  }))}
                  onSelect={(formattedArray) => setInfo("tags", formattedArray)}
                  isMulti
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-4">
              <div className="mb20">
                <InputB
                  id="service-price"
                  name="service-price"
                  label="Αμοιβή"
                  type="number"
                  min={10}
                  max={50000}
                  defaultValue={info.price}
                  value={info.price}
                  onChange={(formattedValue) =>
                    setInfo("price", formattedValue)
                  }
                  className="form-control input-group"
                  errors={errors}
                  disabled={!info.fixed}
                  append="€"
                  formatSymbols
                />
              </div>
            </div>
            {type.subscription ? (
              <div className="col-sm-4">
                <div className="mb20 ">
                  <label htmlFor="subscription-type" className="dark-color">
                    Μηνιαία ή Ετήσια
                  </label>
                  <div className="form-check form-switch switch-style1">
                    <input
                      type="checkbox"
                      role="switch"
                      id="subscription-type"
                      name="subscription-type"
                      checked={
                        info.subscription_type === "monthly" ? false : true
                      }
                      onChange={handleSubscriptionTypeChange}
                      className="form-check-input"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="col-sm-4">
                <div className="mb20 fw400">
                  <InputB
                    id="service-time"
                    name="service-time"
                    label="Χρόνος Παράδοσης"
                    type="number"
                    min={1}
                    append="Μέρες"
                    defaultValue={info.time}
                    value={info.time}
                    onChange={(formattedValue) =>
                      setInfo("time", formattedValue)
                    }
                    className="form-control input-group"
                    errors={errors}
                    formatSymbols
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          className="ud-btn btn-thm mt20 no-rotate"
          onClick={saveInfo}
        >
          Αποθήκευση
          <i className="fa-solid fa-floppy-disk"></i>
        </button>
      </div>
    </div>
  );
}
