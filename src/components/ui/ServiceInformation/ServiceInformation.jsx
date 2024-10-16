"use client";

import InputB from "@/components/inputs/InputB";
import TextArea from "@/components/inputs/TextArea";
import React, { useCallback, useEffect, useState } from "react";
import useCreateServiceStore from "@/store/service/createServiceStore";
import SelectInputSearch from "../../dashboard/option/SelectInputSearch";
import { LOCATION_SEARCH } from "@/lib/graphql/queries/main/location";
import { useQuery } from "@apollo/client";

export default function ServiceInformation() {
  const { info, setInfo, saveInfo, errors, handleStepsTypeChange, type } =
    useCreateServiceStore();

  const [locationParams, setLocationParams] = useState({
    countyTerm: "",
    areaTerm: "",
    zipcodeTerm: "",
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

  const handleLocationSearch = useCallback((field, term) => {
    setLocationParams((prev) => ({ ...prev, [`${field}Term`]: term }));
  }, []);

  const {
    data: location,
    error,
    loading,
    refetch,
  } = useQuery(LOCATION_SEARCH, {
    variables: {
      countyId: info.county.id,
      areaId: info.area.id,
      countyTerm: locationParams.countyTerm,
      areaTerm: locationParams.areaTerm,
      zipcodeTerm: locationParams.zipcodeTerm,
    },
  });

  const locationData = {
    counties: location?.counties?.data || [],
    areas: location?.areas?.data || [],
    zipcodes: location?.zipcodes?.data || [],
  };

  const locationOptions = {
    counties: locationData.counties.map((county) => ({
      value: county.id,
      label: county.attributes.name,
    })),
    areas: locationData.areas.map((area) => ({
      value: area.id,
      label: area.attributes.name,
    })),
    zipcodes: locationData.zipcodes.map((zipcode) => ({
      value: zipcode.id,
      label: zipcode.attributes.name,
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
          </div> */}
          <div className="row">
            <h4>Τοποθεσία</h4>
            <div className="col-sm-4">
              <div className="mb20">
                <SelectInputSearch
                  options={locationOptions.counties}
                  name="service-location-county"
                  label="Νομός"
                  labelPlural="νομοί"
                  errors={errors}
                  isSearchable={true}
                  defaultValue={info.county.name}
                  onSelect={(selected) =>
                    setInfo("county", {
                      id: Number(selected.id),
                      name: selected.label,
                    })
                  }
                  onSearch={(term) => handleLocationSearch("county", term)}
                  capitalize
                />
              </div>
            </div>
            <div className="col-sm-4">
              <div className="mb20">
                <SelectInputSearch
                  options={locationOptions.areas}
                  name="service-location-area"
                  label="Περιοχή"
                  labelPlural="περιοχές"
                  errors={errors}
                  isSearchable={true}
                  defaultValue={info.area.name}
                  onSelect={(selected) =>
                    setInfo("area", {
                      id: Number(selected.id),
                      name: selected.label,
                    })
                  }
                  onSearch={(term) => handleLocationSearch("area", term)}
                  capitalize
                />
              </div>
            </div>
            <div className="col-sm-4">
              <div className="mb20">
                <SelectInputSearch
                  options={locationOptions.zipcodes}
                  name="service-location-zipcode"
                  label="Τ.Κ"
                  labelPlural="τ.κ"
                  errors={errors}
                  isSearchable={true}
                  defaultValue={info.zipcode.name}
                  onSelect={(selected) =>
                    setInfo("zipcode", {
                      id: Number(selected.id),
                      name: selected.label,
                    })
                  }
                  onSearch={(term) => handleLocationSearch("zipcode", term)}
                  capitalize
                />
              </div>
            </div>
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
