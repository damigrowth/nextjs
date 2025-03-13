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
import { TAGS_SEARCH_COMPLETE } from "@/lib/graphql/queries/main/taxonomies/service/tag";

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

  useEffect(() => {
    initializeWithService(service);
  }, [service]);

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

  const categoryId = info?.category?.id;

  const handleSubcategorySearch = useCallback(
    async (searchTerm, page = 1) => {
      const query = normalizeQuery(SUBCATEGORIES_SEARCH);
      const data = await searchData({
        query,
        searchTerm,
        page,
        additionalVariables: {
          categoryId: categoryId || null,
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
    [categoryId]
  );

  const subcategoryId = info?.subcategory?.id;

  const handleSubdivisionSearch = useCallback(
    async (searchTerm, page = 1) => {
      const query = normalizeQuery(SUBDIVISIONS_SEARCH);
      const data = await searchData({
        query,
        searchTerm,
        page,
        additionalVariables: {
          subcategoryId: subcategoryId || null,
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
    [subcategoryId]
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
          value: tag.id,
          label: tag.data?.attributes?.label || tag.label || "",
          isNewTerm: tag.isNewTerm || false,
          data: tag.data || null,
          attributes: tag.attributes || tag.data?.attributes || null,
        }))
      : [];

    console.log("Selected and formatted tags:", formattedTags);
    setInfo("tags", formattedTags);
  };

  const handleCategorySelect = useCallback(
    (selected) => {
      setInfo("category", {
        id: selected ? selected.id : 0,
        label: selected ? selected.attributes.label : "",
      });

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

  const getChangedFields = () => {
    const changes = {};

    if (info.title !== service.title) {
      changes.title = info.title;
    }
    if (info.description !== service.description) {
      changes.description = info.description;
    }
    if (info.price !== service.price) {
      changes.price = info.price;
    }
    if (status !== service.status.data.attributes.type) {
      changes.status = status;
    }

    // Compare category IDs properly
    const categoryId = info.category?.id?.toString();
    const originalCategoryId = service.category?.data?.id?.toString();
    if (categoryId !== originalCategoryId) {
      changes.category = info.category
        ? {
            id: info.category.id,
            label: info.category.label || "",
          }
        : null;
    }

    // Compare subcategory IDs properly
    const subcategoryId = info.subcategory?.id?.toString();
    const originalSubcategoryId = service.subcategory?.data?.id?.toString();
    if (subcategoryId !== originalSubcategoryId) {
      changes.subcategory = info.subcategory
        ? {
            id: info.subcategory.id,
            label: info.subcategory.label || "",
          }
        : null;
    }

    // Compare subdivision IDs properly
    const subdivisionId = info.subdivision?.id?.toString();
    const originalSubdivisionId = service.subdivision?.data?.id?.toString();
    if (subdivisionId !== originalSubdivisionId) {
      changes.subdivision = info.subdivision
        ? {
            id: info.subdivision.id,
            label: info.subdivision.label || "",
          }
        : null;
    }

    // Compare tags more accurately - by checking IDs
    const currentTagIds = info.tags.map((tag) => tag.id).sort();
    const originalTagIds = (service.tags?.data || [])
      .map((tag) => tag.id)
      .sort();
    const tagsChanged =
      JSON.stringify(currentTagIds) !== JSON.stringify(originalTagIds);

    if (tagsChanged) {
      // Enhanced tag format with more complete data
      changes.tags = info.tags.map((tag) => ({
        id: tag.id,
        label: tag.label || tag.data?.attributes?.label || "",
        isNewTerm: tag.isNewTerm || false,
        // Include additional data to ensure labels are preserved
        data: tag.data || null,
        attributes: tag.attributes || tag.data?.attributes || null,
      }));
    }

    // Get current addons and faq from store
    const { addons, faq, initialValues } = useEditServiceStore.getState();

    // Check for addon changes
    const addonsChanged =
      JSON.stringify(addons) !== JSON.stringify(initialValues.addons);
    if (addonsChanged) {
      changes.addons = addons;
    }

    // Check for FAQ changes
    const faqChanged =
      JSON.stringify(faq) !== JSON.stringify(initialValues.faq);
    if (faqChanged) {
      changes.faq = faq;
    }

    return changes;
  };

  const handleSubmit = async () => {
    const changedFields = getChangedFields();
    const { media, deletedMediaIds } = useEditServiceStore.getState();

    // Check if media has changed
    const mediaChanged =
      media.some((item) => item.file instanceof File) ||
      deletedMediaIds.length > 0;

    // If no fields changed and media didn't change, don't submit
    if (!Object.keys(changedFields).length && !mediaChanged) {
      console.log("No changes detected, skipping submission");
      return;
    }


    const formData = new FormData();
    formData.append("service-id", service.id);
    formData.append("changes", JSON.stringify(changedFields));

    // Always include media information in the form data if there's a change
    if (mediaChanged) {
      const remainingMediaIds = media
        .filter((item) => item.file.attributes)
        .map((item) => item.file.id);

      const allNewFiles = media
        .filter((item) => item.file instanceof File)
        .map((item) => item.file);

      const validNewFiles = allNewFiles.filter(
        (file) => file.size > 0 && file.name !== "undefined"
      );

      const uniqueFileNames = [
        ...new Set(validNewFiles.map((file) => file.name)),
      ];

      const uniqueFiles = uniqueFileNames.map((name) =>
        validNewFiles.find((file) => file.name === name)
      );

      console.log("Remaining media IDs:", remainingMediaIds);
      console.log("Valid new files:", validNewFiles);
      console.log("Unique files:", uniqueFiles);

      formData.append("remaining-media", JSON.stringify(remainingMediaIds));
      formData.append("deleted-media", JSON.stringify(deletedMediaIds));

      // Make sure we properly append each file
      if (uniqueFiles.length > 0) {
        console.log("Adding files to form data");
        uniqueFiles.forEach((file) => {
          if (file) {
            formData.append("media-files", file);
            console.log("Added file:", file.name);
          }
        });
      }
    }

    // Debug log the form data
    for (let [key, value] of formData.entries()) {
      console.log(`Form data: ${key} = `, value);
    }

    // Make the form action call
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
                  isDisabled={!info?.category?.id}
                  resetDependency={info?.category?.id}
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
                  isDisabled={!info?.subcategory?.id}
                  resetDependency={info?.subcategory?.id}
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
