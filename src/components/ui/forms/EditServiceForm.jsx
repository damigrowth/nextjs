"use client";

import InputB from "@/components/inputs/InputB";
import TextArea from "@/components/inputs/TextArea";
import React, { useEffect, useActionState } from "react";
import SwitchB from "../Archives/Inputs/SwitchB";
import ServiceGallery from "../AddService/ServiceGallery";
import ServiceFaq from "../ServiceFaq/ServiceFaq";
import { editService } from "@/lib/service/edit";
import ServiceAddons from "../AddService/ServiceAddons";
import useEditServiceStore from "@/store/service/edit/editServiceStore";
import SaveButton from "../buttons/SaveButton";
import Alert from "../alerts/Alert";

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
