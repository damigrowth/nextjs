"use client";

import InputB from "@/components/inputs/InputB";
import TextArea from "@/components/inputs/TextArea";
import React, { useEffect, useActionState, useState, useCallback } from "react";
import SwitchB from "../Archives/Inputs/SwitchB";
import ServiceGallery from "../AddService/ServiceGallery";
import ServiceFaq from "../ServiceFaq/ServiceFaq";
import { editService } from "@/lib/service/edit";
import ServiceAddons from "../AddService/ServiceAddons";
import useEditServiceStore from "@/store/service/edit/editServiceStore";
import SaveButton from "../buttons/SaveButton";
import Alert from "../alerts/Alert";
import SearchableSelect from "../Archives/Inputs/SearchableSelect";
import { normalizeQuery } from "@/utils/queries";
import { searchData } from "@/lib/client/operations";
import {
  CATEGORIES_SEARCH,
  SUBCATEGORIES_SEARCH,
  SUBDIVISIONS_SEARCH,
} from "@/lib/graphql/queries/main/taxonomies/service";
import { TAGS_SEARCH_BY_CATEGORY } from "@/lib/graphql/queries/main/taxonomies/service/tag";

export default function EditServiceForm({ service }) {
  const initialState = {
    data: null,
    errors: {},
    message: null,
  };

  const [formState, formAction, isPending] = useActionState(
    editService,
    initialState
  );

  // Status state
  const {
    info,
    setInfo,
    status,
    setStatus,
    errors,
    hasChanges,
    saveInfo,
    saveAddons,
    saveFaq,
    saveGallery,
    initializeWithService,
  } = useEditServiceStore();

  // Initialize store with service data on component mount
  useEffect(() => {
    initializeWithService(service);
  }, [service]);

  // State for taxonomy search params and results
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

  // Handler functions for taxonomy search
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

  const handleTagsSearch = useCallback(async (searchTerm, page = 1) => {
    const query = normalizeQuery(TAGS_SEARCH_BY_CATEGORY);
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

  // Selection handlers for taxonomy fields
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

  // Format selected values for SearchableSelect components

  const handleSubmit = async (formData) => {
    if (!hasChanges()) return;

    // Validate all sections using store functions
    saveInfo();
    saveAddons();
    saveFaq();
    saveGallery();

    // Check if there are any validation errors
    if (errors.active) return;

    // Get current values from store
    const { info, addons, faq, media, deletedMediaIds } =
      useEditServiceStore.getState();

    // Prepare form data
    formData.append("service-id", service.id);
    formData.append("service-title", info.title);
    formData.append("service-description", info.description);
    formData.append("service-price", info.price);
    formData.append("status", status);
    formData.append("addons", JSON.stringify(addons));
    formData.append("faq", JSON.stringify(faq));

    // Add taxonomy data
    formData.append("service-category", info.category.id);
    formData.append("service-subcategory", info.subcategory.id);
    formData.append("service-subdivision", info.subdivision.id);


    formData.append("service-tags", JSON.stringify(info.tags));

    // Handle media
    const remainingMediaIds = media
      .filter((item) => item.file.attributes)
      .map((item) => item.file.id);

    // Get new valid files
    const allNewFiles = media
      .filter((item) => item.file instanceof File)
      .map((item) => item.file);

    const validNewFiles = allNewFiles.filter(
      (file) => file.size > 0 && file.name !== "undefined"
    );

    // Remove duplicates
    const uniqueFileNames = [
      ...new Set(validNewFiles.map((file) => file.name)),
    ];

    const uniqueFiles = uniqueFileNames.map((name) =>
      validNewFiles.find((file) => file.name === name)
    );

    // Add to formData
    formData.append("remaining-media", JSON.stringify(remainingMediaIds));
    formData.append("deleted-media", JSON.stringify(deletedMediaIds));

    if (uniqueFiles.length > 0) {
      uniqueFiles.forEach((file) => {
        formData.append("media-files", file);
      });
    }

    // Submit if validation passed
    formAction(formData);
  };

  return (
    <form action={handleSubmit}>
      <div className="ps-widget bdrs4 mb30 position-relative">
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
                onChange={(formattedValue) =>
                  setInfo("description", formattedValue)
                }
              />
            </div>
          </div>

          {/* New taxonomy fields section */}
          <div className="row">
            <div className="col-sm-4">
              <div className="mb20">
                <SearchableSelect
                  name="service-category"
                  label="Κατηγορία"
                  labelPlural="κατηγορίες"
                  value={info.category}
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
                  label="Υποκατηγορία"
                  labelPlural="υποκατηγορίες"
                  value={info.subcategory}
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
                  label="Αντικείμενο"
                  labelPlural="αντικείμενα"
                  value={info.subdivision}
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
                label="Tags"
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
          {/* End of new taxonomy fields section */}

          <div className="row">
            <div className="col-sm-2">
              <div className="mb20">
                <SwitchB
                  label="Κατάσταση"
                  initialValue={status === "Active"}
                  activeText="Ενεργή"
                  inactiveText="Σε Παύση"
                  onChange={(isActive) => {
                    setStatus(isActive ? "Active" : "Paused");
                  }}
                />
              </div>
            </div>
          </div>
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
                  value={info.price}
                  onChange={(formattedValue) =>
                    setInfo("price", formattedValue)
                  }
                  className="form-control input-group"
                  errors={errors}
                  append="€"
                  formatSymbols
                />
              </div>
            </div>
          </div>
          <div className="mb30">
            <label className="form-label fw500 dark-color">Πρόσθετα</label>
            <ServiceAddons custom={true} editMode={true} />
          </div>
          <div className="mb30">
            <label className="form-label fw500 dark-color">
              Συχνές Ερωτήσεις
            </label>
            <ServiceFaq custom={true} editMode={true} />
          </div>
          <div>
            <label className="form-label fw500 dark-color">Πολυμέσα</label>
            <ServiceGallery custom={true} editMode={true} />
          </div>
        </div>
        <div className="d-flex flex-lg-column align-items-lg-center">
          <Alert
            type={formState?.errors ? "error" : "success"}
            message={formState?.message}
          />

          <SaveButton
            defaultText="Ενημέρωση Υπηρεσίας"
            loadingText="Ενημέρωση Υπηρεσίας..."
            isPending={isPending}
            hasChanges={hasChanges()}
          />
        </div>
      </div>
    </form>
  );
}
