"use client";

import InputB from "@/components/inputs/InputB";
import TextArea from "@/components/inputs/TextArea";
import React from "react";
import useCreateServiceStore from "@/store/service/createServiceStore";
import SelectInputSearch from "../../dashboard/option/SelectInputSearch";
import { useSearchParams } from "next/navigation";
import {
  AREAS_BY_COUNTY,
  COUNTY_SEARCH,
  ZIPCODES_BY_AREA,
} from "@/lib/queries";
import useSWR from "swr";

export default function ServiceInformation({ categories, tags }) {
  const { info, setInfo, saveInfo, errors, handleStepsTypeChange } =
    useCreateServiceStore();

  const searchParams = useSearchParams();

  const locationParams = {
    county_search: searchParams.get("counties") || "",
    county: info.county.id,
    area: info.area.id,
    zipcode: info.zipcode.id,
  };

  const categoryOptions = categories.map((category) => ({
    value: Number(category.id),
    label: category.attributes.label,
  }));

  const tagOptions = tags.map((tag) => ({
    value: Number(tag.id),
    label: tag.attributes.label,
  }));

  const handlePriceTypeChange = (e) => {
    const isFixed = e.target.checked;
    setInfo("fixed", !isFixed);
    handleStepsTypeChange(!isFixed);
  };

  const fetcher = (...args) => fetch(...args).then((res) => res.json());

  const { data: counties } = useSWR(
    `https://api.doulitsa.gr/api/${COUNTY_SEARCH(
      locationParams.county_search
    )}`,
    fetcher
  );
  const { data: areas } = useSWR(
    `https://api.doulitsa.gr/api/${AREAS_BY_COUNTY(locationParams.county)}`,
    fetcher
  );
  const { data: zipcodes } = useSWR(
    `https://api.doulitsa.gr/api/${ZIPCODES_BY_AREA(locationParams.area)}`,
    fetcher
  );

  const locationData = {
    counties: counties?.data || [],
    areas: areas?.data?.attributes?.areas?.data || [],
    zipcodes: zipcodes?.data?.attributes?.zipcodes?.data || [],
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

  // console.log("category", info.zipcode);
  // console.log("TAGS", info.tags);

  return (
    <div>
      <div className="ps-widget bgc-white bdrs4 p30 mb30 position-relative">
        <div className="bdrb1 pb15 mb25">
          <h3 className="list-title">Βασικές Πληροφορίες</h3>
        </div>
        <div className="form-style1">
          <div className="row">
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
              {/* <label className="heading-color ff-heading fw500 mb10">
                Περιγραφή
              </label>
              <TextEditor
                content={info.description}
                limit={5000}
                id="service-description"
                name="service-description"
                errors={errors}
                onChange={(value) => setInfo("description", value.content)}
              /> */}
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
              <div className="mb20 ">
                <label htmlFor="pricing-type" className="fw500 dark-color ">
                  Απλή Αμοιβή ή Πακέτα
                </label>
                <div className="form-check form-switch switch-style1">
                  <input
                    type="checkbox"
                    role="switch"
                    id="pricing-type"
                    name="pricing-type"
                    checked={!info.fixed}
                    onChange={handlePriceTypeChange}
                    className="form-check-input"
                  />
                </div>
              </div>
            </div>
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
            <div className="col-sm-4">
              <div className="mb20">
                <InputB
                  id="service-time"
                  name="service-time"
                  label="Χρόνος Παράδοσης"
                  type="number"
                  min={1}
                  append="Μέρες"
                  defaultValue={info.time}
                  value={info.time}
                  onChange={(formattedValue) => setInfo("time", formattedValue)}
                  className="form-control input-group"
                  errors={errors}
                  formatSymbols
                />
              </div>
            </div>
          </div>
          <div className="row">
            <h4>Τοποθεσία</h4>
            <div className="col-sm-4">
              <div className="mb20">
                <SelectInputSearch
                  type="object"
                  id="service-location-county"
                  name="service-location-county"
                  label="Νομός"
                  labelPlural="νομοί"
                  query="counties"
                  querySelection="county"
                  errors={errors}
                  isSearchable={true}
                  options={locationOptions.counties}
                  defaultValue={info.county.name}
                  onSelect={({ id, title }) =>
                    setInfo("county", { id, name: title })
                  }
                  capitalize
                />
              </div>
            </div>
            <div className="col-sm-4">
              <div className="mb20">
                <SelectInputSearch
                  type="object"
                  id="service-location-area"
                  name="service-location-area"
                  label="Περιοχή"
                  labelPlural="περιοχές"
                  query="areas"
                  querySelection="area"
                  errors={errors}
                  isSearchable={true}
                  options={locationOptions.areas}
                  defaultValue={info.area.name}
                  onSelect={({ id, title }) =>
                    setInfo("area", { id, name: title })
                  }
                  capitalize
                />
              </div>
            </div>
            <div className="col-sm-4">
              <div className="mb20">
                <SelectInputSearch
                  type="object"
                  id="service-location-zipcode"
                  name="service-location-zipcode"
                  label="Τ.Κ"
                  labelPlural="τ.κ"
                  query="zipcodes"
                  querySelection="zipcode"
                  errors={errors}
                  isSearchable={true}
                  options={locationOptions.zipcodes}
                  defaultValue={info.zipcode.name}
                  onSelect={({ id, title }) =>
                    setInfo("zipcode", { id, name: title })
                  }
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
