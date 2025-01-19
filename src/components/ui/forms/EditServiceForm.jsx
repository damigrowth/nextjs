"use client";

import InputB from "@/components/inputs/InputB";
import TextArea from "@/components/inputs/TextArea";
import React, { useEffect, useState, useActionState, useRef } from "react";
import Switch from "../Archives/Inputs/Switch";
import SwitchB from "../Archives/Inputs/SwitchB";
import NewAddonInputs from "../ServiceAddons/NewAddonInputs";
import AddonsList from "../ServiceAddons/AddonsList";
import AddonsListEdit from "../ServiceAddons/AddonsListEdit";
import useCreateServiceStore from "@/store/service/createServiceStore";
import FaqList from "../ServiceFaq/FaqList";
import NewFaqInputs from "../ServiceFaq/NewFaqInputs";
import ServiceGallery from "../AddService/ServiceGallery";
import ServiceFaq from "../ServiceFaq/ServiceFaq";
import { editService } from "@/lib/service/edit";
import ServiceAddons from "../AddService/ServiceAddons";

export default function EditServiceForm({ service }) {
  const initialValues = useRef({
    title: service.title,
    description: service.description,
    price: service.price,
    status: service.status.data.attributes.type,
    addons: service.addons || [],
    faq: service.faq || [],
  });

  const initialState = {
    data: null,
    errors: {},
    message: null,
  };

  // Status state
  const [status, setStatus] = useState(service.status.data.attributes.type);

  const [formState, formAction, isPending] = useActionState(
    editService,
    initialState
  );

  const { info, setInfo, saveInfo, saveFaq, saveAddons, saveGallery, errors } =
    useCreateServiceStore();

  // Initialize stores with service data
  useEffect(() => {
    // Info store initialization
    useCreateServiceStore.setState({
      info: {
        fixed: true,
        title: service.title,
        description: service.description,
        price: service.price,
        category: service.category.data,
        subcategory: service.subcategory.data,
        subdivision: service.subdivision.data,
        tags: service.tags?.data || [],
      },
    });

    // Initialize addons and faq stores
    if (service.addons) {
      useCreateServiceStore.setState({ addons: service.addons });
    }
    if (service.faq) {
      useCreateServiceStore.setState({ faq: service.faq });
    }

    if (service.media?.data) {
      const formattedMedia = service.media.data.map((mediaItem) => ({
        file: mediaItem,
        url: mediaItem.attributes.url,
      }));

      useCreateServiceStore.setState({
        gallery: service.media,
        media: formattedMedia,
        deletedMediaIds: [],
      });
    }
  }, [service]);

  const hasChanges = () => {
    const currentState = useCreateServiceStore.getState();

    return (
      status !== initialValues.current.status ||
      currentState.info.title !== initialValues.current.title ||
      currentState.info.description !== initialValues.current.description ||
      currentState.info.price !== initialValues.current.price ||
      JSON.stringify(currentState.addons) !==
        JSON.stringify(initialValues.current.addons) ||
      JSON.stringify(currentState.faq) !==
        JSON.stringify(initialValues.current.faq) ||
      currentState.media.some((item) => item.file instanceof File) ||
      currentState.deletedMediaIds.length > 0
    );
  };

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
      useCreateServiceStore.getState();

    // Prepare form data
    formData.append("service-id", service.id);
    formData.append("service-title", info.title);
    formData.append("service-description", info.description);
    formData.append("service-price", info.price);
    formData.append("status", status);
    formData.append("addons", JSON.stringify(addons));
    formData.append("faq", JSON.stringify(faq));

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

  // console.log("MEDIA", service.media);

  // console.log("hasChanges", hasChanges());

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
            <div className="mb20">
              {/* <SelectInputSearch
                    options={tagOptions}
                    name="service-tags"
                    label="Tags"
                    labelPlural="tags"
                    errors={errors}
                    isLoading={tagsLoading}
                    isSearchable={true}
                    value={selectedTagsValue}
                    onSelect={(selected) => handleSelect("tags", selected)}
                    onSearch={(term) => handleSearch("tags", term)}
                    isMulti={true}
                    isClearable={true}
                  /> */}
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
            <ServiceAddons custom={true} />
          </div>
          <div className="mb30">
            <label className="form-label fw500 dark-color">
              Συχνές Ερωτήσεις
            </label>
            <ServiceFaq custom={true} />
          </div>
          <div>
            <label className="form-label fw500 dark-color">Πολυμέσα</label>
            <ServiceGallery custom={true} />
          </div>
        </div>
        <div className="d-flex flex-lg-column align-items-lg-center">
          {formState?.message && (
            <div className="mb10">
              <p
                className={`${
                  formState?.errors ? "text-danger" : "text-success"
                }`}
              >
                {formState?.message}
              </p>
            </div>
          )}
          <button
            type="submit"
            disabled={!hasChanges() || isPending}
            className={`ud-btn btn-dark mt20 no-rotate text-center ${
              !hasChanges() || isPending ? "btn-dark-disabled" : ""
            }`}
          >
            {isPending ? "Ενημέρωση Υπηρεσίας..." : "Ενημέρωση Υπηρεσίας"}
            {isPending ? (
              <div
                className="spinner-border spinner-border-sm ml10"
                role="status"
              >
                <span className="sr-only"></span>
              </div>
            ) : (
              <i className="fa-solid fa-floppy-disk"></i>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
