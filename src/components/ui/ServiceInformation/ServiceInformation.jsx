"use client";

import InputB from "@/components/inputs/InputB";
import TextArea from "@/components/inputs/TextArea";
import React, { useCallback, useState } from "react";
import useCreateServiceStore from "@/store/service/create/createServiceStore";
import { useQuery } from "@apollo/client";
import {
  CATEGORIES_SEARCH,
  SUBCATEGORIES_SEARCH,
  SUBDIVISIONS_SEARCH,
} from "@/lib/graphql/queries/main/taxonomies/service";
import { TAGS_SEARCH_COMPLETE } from "@/lib/graphql/queries/main/taxonomies/service/tag";
import SearchableSelect from "../Archives/Inputs/SearchableSelect";
import { normalizeQuery } from "@/utils/queries";
import { searchData } from "@/lib/client/operations";
import SwitchB from "../Archives/Inputs/SwitchB";
import { subscriptionTypeOptions } from "@/data/global/collections";

export default function ServiceInformation() {
  const {
    info,
    setInfo,
    showPrice,
    setShowPrice,
    errors,
    handleStepsTypeChange,
    type,
  } = useCreateServiceStore();

  const [taxonomyParams, setTaxonomyParams] = useState({
    categoryTerm: "",
    subcategoryTerm: "",
    subdivisionTerm: "",
    tagsTerm: "",
  });

  const [noResultsState, setNoResultsState] = useState({
    category: false,
    subcategory: false,
    subdivision: false,
    tags: false,
  });

  // Handler functions for SearchableSelect
  const handleCategorySearch = useCallback(async (searchTerm, page = 1) => {
    const query = normalizeQuery(CATEGORIES_SEARCH);
    const data = await searchData({
      query,
      searchTerm,
      page,
      additionalVariables: {
        categoryTerm: searchTerm,
        categoriesPage: page,
        categoriesPageSize: 10,
      },
    });

    // Set no results state
    if (data && data.data) {
      setNoResultsState((prev) => ({
        ...prev,
        category: data.data.length === 0,
      }));
    }

    return data;
  }, []);

  const handleSubcategorySearch = useCallback(
    async (searchTerm, page = 1) => {
      const query = normalizeQuery(SUBCATEGORIES_SEARCH);
      const data = await searchData({
        query,
        searchTerm,
        page,
        additionalVariables: {
          categoryId: info.category.id,
          subcategoryTerm: searchTerm,
          subcategoriesPage: page,
          subcategoriesPageSize: 10,
        },
      });

      // Set no results state
      if (data && data.data) {
        setNoResultsState((prev) => ({
          ...prev,
          subcategory: data.data.length === 0,
        }));
      }

      return data;
    },
    [info.category.id]
  );

  const handleSubdivisionSearch = useCallback(
    async (searchTerm, page = 1) => {
      const query = normalizeQuery(SUBDIVISIONS_SEARCH);
      const data = await searchData({
        query,
        searchTerm,
        page,
        additionalVariables: {
          subcategoryId: info.subcategory.id,
          subdivisionTerm: searchTerm,
          subdivisionsPage: page,
          subdivisionsPageSize: 10,
        },
      });

      // Set no results state
      if (data && data.data) {
        setNoResultsState((prev) => ({
          ...prev,
          subdivision: data.data.length === 0,
        }));
      }

      return data;
    },
    [info.subcategory.id]
  );

  // Split handlers for different field types
  const handleCategorySelect = useCallback(
    (selected) => {
      setInfo("category", {
        id: selected ? selected.id : 0,
        label: selected ? selected.attributes.label : "",
      });

      // Reset dependent fields
      setInfo("subcategory", { id: 0, label: "" });
      setInfo("subdivision", { id: 0, label: "" });
      setTaxonomyParams((prev) => ({
        ...prev,
        subcategoryTerm: "",
        subdivisionTerm: "",
      }));
    },
    [setInfo, setTaxonomyParams]
  );

  const handleSubcategorySelect = useCallback(
    (selected) => {
      setInfo("subcategory", {
        id: selected ? selected.id : 0,
        label: selected ? selected.attributes.label : "",
      });

      // Reset subdivision when subcategory changes
      setInfo("subdivision", { id: 0, label: "" });
      setTaxonomyParams((prev) => ({
        ...prev,
        subdivisionTerm: "",
      }));
    },
    [setInfo, setTaxonomyParams]
  );

  const handleSubdivisionSelect = useCallback(
    (selected) => {
      setInfo("subdivision", {
        id: selected ? selected.id : 0,
        label: selected ? selected.attributes.label : "",
      });
    },
    [setInfo]
  );

  const handleTagsSearch = useCallback(async (searchTerm, page = 1) => {
    const query = normalizeQuery(TAGS_SEARCH_COMPLETE);
    const data = await searchData({
      query,
      searchTerm,
      searchTermType: "label",
      page,
      additionalVariables: {
        label: searchTerm,
        tagsPage: page,
        tagsPageSize: 10,
      },
    });

    // Set no results state
    if (data && data.data) {
      setNoResultsState((prev) => ({
        ...prev,
        tags: data.data.length === 0,
      }));
    }

    return data;
  }, []);

  const selectedTagsValue = {
    data: info.tags.map((tag) => ({
      id: tag.id,
      value: tag.id,
      label: tag.data?.attributes?.label || tag.label || "",
      isNewTerm: tag.isNewTerm || false,
      data: tag.data || null,
      attributes: tag.attributes || null,
    })),
  };

  const handleTagsSelect = (selected) => {
    const formattedTags = selected
      ? selected.map((tag) => ({
          id: tag.id,
          label: tag.data?.attributes?.label || "",
          isNewTerm: tag.isNewTerm || false,
          data: tag.data || null,
          attributes: tag.attributes || null,
        }))
      : [];

    setInfo("tags", formattedTags);
  };

  const handleSubscriptionTypeSelect = useCallback(
    (selected) => {
      setInfo("subscription_type", selected.data ? selected.data.value : null);
    },
    [setInfo]
  );

  // Format for SearchableSelect component
  const selectedSubscriptionType = info.subscription_type
    ? {
        id: info.subscription_type,
        attributes: {
          label:
            subscriptionTypeOptions.find(
              (opt) => opt.value === info.subscription_type
            )?.label || "Άγνωστο",
        },
      }
    : null;

  // Creating proper value objects for SearchableSelect
  const categoryValue =
    info.category && info.category.id
      ? {
          data: {
            id: info.category.id,
            attributes: {
              label: info.category.label,
            },
          },
        }
      : { data: null };

  const subcategoryValue =
    info.subcategory && info.subcategory.id
      ? {
          data: {
            id: info.subcategory.id,
            attributes: {
              label: info.subcategory.label,
            },
          },
        }
      : { data: null };

  const subdivisionValue =
    info.subdivision && info.subdivision.id
      ? {
          data: {
            id: info.subdivision.id,
            attributes: {
              label: info.subdivision.label,
            },
          },
        }
      : { data: null };

  const handleHidePriceToggle = (checked) => {
    // If checked, hide price (showPrice = false)
    // If unchecked, show price (showPrice = true)
    setShowPrice(!checked);

    // If hiding price (checked = true), set price to 0
    if (checked) {
      setInfo("price", 0);
    } else {
      setInfo("price", 10);
    }
  };

  return (
    <div>
      <div className="ps-widget bdrs4 p30 mb30 position-relative">
        <div className="bdrb1 pb15 mb25">
          <h3 className="list-title">Βασικές Πληροφορίες</h3>
        </div>
        <div className="form-style1">
          <div className="row">
            <div className="mb10">
              <InputB
                label="Τίτλος*"
                id="service-title"
                name="service-title"
                type="text"
                maxLength={80}
                value={info.title}
                onChange={(formattedValue) => setInfo("title", formattedValue)}
                className="form-control input-group"
                errors={errors}
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
                label="Περιγραφή* (τουλάχιστον 80 χαρακτήρες)"
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
            <div className="col-sm-4 pb-4">
              <div className="mb20">
                <SearchableSelect
                  name="service-category"
                  label="Κατηγορία*"
                  labelPlural="κατηγορίες"
                  value={categoryValue.data}
                  nameParam="label"
                  pageParam="categoriesPage"
                  pageSizeParam="categoriesPageSize"
                  pageSize={10}
                  onSearch={handleCategorySearch}
                  onSelect={handleCategorySelect}
                  isMulti={false}
                  isClearable={true}
                  formatSymbols
                  capitalize
                  errors={errors?.field === "category" ? errors : null}
                />
              </div>
            </div>
            <div className="col-sm-4">
              <div className="mb20">
                <SearchableSelect
                  name="service-subcategory"
                  label="Υποκατηγορία*"
                  labelPlural="υποκατηγορίες"
                  value={subcategoryValue.data}
                  nameParam="label"
                  pageParam="subcategoriesPage"
                  pageSizeParam="subcategoriesPageSize"
                  pageSize={10}
                  onSearch={handleSubcategorySearch}
                  onSelect={handleSubcategorySelect}
                  isMulti={false}
                  isClearable={true}
                  formatSymbols
                  capitalize
                  errors={errors?.field === "subcategory" ? errors : null}
                  isDisabled={!info.category.id}
                  resetDependency={info.category.id}
                />
              </div>
            </div>
            <div className="col-sm-4">
              <div className="mb20">
                <SearchableSelect
                  name="service-subdivision"
                  label="Αντικείμενο*"
                  labelPlural="αντικείμενα"
                  value={subdivisionValue.data}
                  nameParam="label"
                  pageParam="subdivisionsPage"
                  pageSizeParam="subdivisionsPageSize"
                  pageSize={10}
                  onSearch={handleSubdivisionSearch}
                  onSelect={handleSubdivisionSelect}
                  isMulti={false}
                  isClearable={true}
                  formatSymbols
                  capitalize
                  errors={errors?.field === "subdivision" ? errors : null}
                  isDisabled={!info.subcategory.id}
                  resetDependency={info.subcategory.id}
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="mb20">
              <SearchableSelect
                name="service-tags"
                label="Tags/Χαρακτηριστικά"
                labelPlural="tags"
                value={selectedTagsValue}
                nameParam="label"
                searchTermType="label"
                pageParam="tagsPage"
                pageSizeParam="tagsPageSize"
                pageSize={10}
                onSearch={handleTagsSearch}
                onSelect={handleTagsSelect}
                isMulti={true}
                isClearable={true}
                formatSymbols
                capitalize
                errors={errors?.field === "tags" ? errors : null}
                allowNewTerms={true}
                newTermValue="new"
                showOptionsOnType={true}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-sm-6">
              <div className="mb20">
                <InputB
                  id="service-price"
                  name="service-price"
                  label="Αμοιβή"
                  type="number"
                  min={!showPrice ? 0 : 10}
                  max={50000}
                  // Use state value directly, handle default/min on blur in InputB
                  value={!showPrice ? 0 : info.price}
                  onChange={(formattedValue) =>
                    setInfo("price", formattedValue)
                  }
                  className="form-control input-group noumera"
                  errors={errors}
                  disabled={!showPrice || !info.fixed}
                  append="€"
                />
              </div>
            </div>
          </div>
          <div className="row mb30">
            <div className="col-sm-6">
              <SwitchB
                label={<span className="fontless">Χωρίς εμφάνιση τιμής</span>}
                name="hide-price"
                initialValue={!showPrice}
                onChange={handleHidePriceToggle}
              />
            </div>
          </div>
          {type.online && type.oneoff && (
            <div className="col-sm-6">
              <div className="mb20 fw400">
                <InputB
                  id="service-time"
                  name="service-time"
                  label="Χρόνος Παράδοσης"
                  type="number"
                  min={1}
                  append={info.time > 1 ? "Μέρες" : "Μέρα"}
                  // Use state value directly, handle default/min on blur in InputB
                  value={info.time}
                  onChange={(formattedValue) => setInfo("time", formattedValue)}
                  className="form-control input-group noumera"
                  errors={errors}
                />
              </div>
            </div>
          )}
          {type.online && type.subscription && (
            <div className="col-sm-6">
              <div className="mb20 ">
                <SearchableSelect
                  name="subscription-type"
                  label="Πληρωμή"
                  labelPlural="τύποι πληρωμής"
                  staticOptions={subscriptionTypeOptions}
                  value={selectedSubscriptionType}
                  onSelect={handleSubscriptionTypeSelect}
                  isMulti={false}
                  isClearable={false}
                  isSearchable={false}
                  errors={errors?.field === "subscription_type" ? errors : null}
                />
              </div>
            </div>
          )}
        </div>
        {/* Remove the save button - saving will be handled by the Next button */}
      </div>
    </div>
  );
}
