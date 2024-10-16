"use client";

import InputB from "@/components/inputs/InputB";
import TextArea from "@/components/inputs/TextArea";
import React, { useCallback, useState } from "react";
import useCreateServiceStore from "@/store/service/createServiceStore";
import SelectInputSearch from "../../dashboard/option/SelectInputSearch";
import { useQuery } from "@apollo/client";
import {
  CATEGORIES_SEARCH,
  SUBCATEGORIES_SEARCH,
  SUBDIVISIONS_SEARCH,
} from "@/lib/graphql/queries/main/taxonomies/service";

export default function ServiceInformation() {
  const { info, setInfo, saveInfo, errors, handleStepsTypeChange, type } =
    useCreateServiceStore();

  const [taxonomyParams, setTaxonomyParams] = useState({
    categoryTerm: "",
    subcategoryTerm: "",
    subdivisionTerm: "",
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

  const handleSelect = (field, selected) => {
    setInfo(field, {
      id: Number(selected.id),
      label: selected.label,
    });

    // Reset dependent fields
    if (field === "category") {
      setInfo("subcategory", { id: 0, label: "" });
      setInfo("subdivision", { id: 0, label: "" });
      setTaxonomyParams((prev) => ({
        ...prev,
        subcategoryTerm: "",
        subdivisionTerm: "",
      }));
    } else if (field === "subcategory") {
      setInfo("subdivision", { id: 0, label: "" });
      setTaxonomyParams((prev) => ({ ...prev, subdivisionTerm: "" }));
    }
  };

  const { data: categoriesRes, loading: categoriesLoading } = useQuery(
    CATEGORIES_SEARCH,
    {
      variables: {
        categoryTerm: taxonomyParams.categoryTerm,
      },
    }
  );
  const { data: subcategoriesRes, loading: subcategoriesLoading } = useQuery(
    SUBCATEGORIES_SEARCH,
    {
      variables: {
        categoryId: info.category.id,
        subcategoryTerm: taxonomyParams.subcategoryTerm,
      },
    }
  );
  const { data: subdivisionsRes, loading: subdivisionsLoading } = useQuery(
    SUBDIVISIONS_SEARCH,
    {
      variables: {
        subcategoryId: info.subcategory.id,
        subdivisionTerm: taxonomyParams.subdivisionTerm,
      },
    }
  );

  const taxonomyData = {
    categories: categoriesRes?.categories?.data || [],
    subcategories: subcategoriesRes?.subcategories?.data || [],
    subdivisions: subdivisionsRes?.subdivisions?.data || [],
  };

  const taxonomyOptions = {
    categories: taxonomyData.categories.map((category) => ({
      value: category.id,
      label: category.attributes.label,
    })),
    subcategories: taxonomyData.subcategories.map((subcategory) => ({
      value: subcategory.id,
      label: subcategory.attributes.label,
    })),
    subdivisions: taxonomyData.subdivisions.map((subdivision) => ({
      value: subdivision.id,
      label: subdivision.attributes.label,
    })),
  };

  return (
    <div>
      <div className="ps-widget bgc-white bdrs4 p30 mb30 position-relative">
        <div className="bdrb1 pb15 mb25">
          <h3 className="list-title">Βασικές Πληροφορίες</h3>
        </div>
        <div className="form-style1">
          <div className="row">
            <div className="mb10">
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
            <div className="col-sm-4">
              <div className="mb20">
                <SelectInputSearch
                  options={taxonomyOptions.categories}
                  name="service-category"
                  label="Κατηγορία"
                  labelPlural="κατηγορίες"
                  errors={errors}
                  isLoading={categoriesLoading}
                  isSearchable={true}
                  value={info.category}
                  onSelect={(selected) => handleSelect("category", selected)}
                  onSearch={(term) => handleSearch("category", term)}
                  capitalize
                />
              </div>
            </div>
            <div className="col-sm-4">
              <div className="mb20">
                <SelectInputSearch
                  options={taxonomyOptions.subcategories}
                  name="service-subcategory"
                  label="Υποκατηγορία"
                  labelPlural="υποκατηγορία"
                  errors={errors}
                  isLoading={subcategoriesLoading}
                  isSearchable={true}
                  value={info.subcategory}
                  onSelect={(selected) => handleSelect("subcategory", selected)}
                  onSearch={(term) => handleSearch("subcategory", term)}
                  capitalize
                />
              </div>
            </div>
            <div className="col-sm-4">
              <div className="mb20">
                <SelectInputSearch
                  options={taxonomyOptions.subdivisions}
                  name="service-subdivision"
                  label="Αντικείμενο"
                  labelPlural="αντικείμενο"
                  errors={errors}
                  isLoading={subdivisionsLoading}
                  isSearchable={true}
                  value={info.subdivision}
                  onSelect={(selected) => handleSelect("subdivision", selected)}
                  onSearch={(term) => handleSearch("subdivision", term)}
                  capitalize
                />
              </div>
            </div>
          </div>
          {/* <div className="row">
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
          </div> */}
          <div className="row">
            <div className="col-sm-2">
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
              <div className="col-sm-2">
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
              <div className="col-sm-2">
                <div className="mb20 fw400">
                  <InputB
                    id="service-time"
                    name="service-time"
                    label="Χρόνος Παράδοσης"
                    type="number"
                    min={1}
                    append={info.time > 1 ? "Μέρες" : "Μέρα"}
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
