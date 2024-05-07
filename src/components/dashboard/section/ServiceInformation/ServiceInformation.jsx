import InputB from "@/components/inputs/InputB";
import TextArea from "@/components/inputs/TextArea";
import React, { useEffect } from "react";
import SelectInput from "../../option/SelectInput";
import SelectInputMultiple from "../../option/SelectInputMultiple";
import useCreateServiceStore from "@/store/service/createServiceStore";
import SelectInputSingle from "../../option/SelectInputSearch";
import SelectInputSearch from "../../option/SelectInputSearch";

export default function ServiceInformation({ categories, skills, locations }) {
  const { service, saveInfo, info, setInfo, errors, handleStepsTypeChange } =
    useCreateServiceStore();

  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.attributes.title,
  }));

  const locationOptions = locations.map((location) => ({
    value: location.id,
    label: `${location.attributes.area} ${location.attributes.zipcode}, ${location.attributes.county} `,
  }));

  const skillOptions = skills.map((skill) => ({
    value: skill.id,
    label: skill.attributes.title,
  }));

  const handlePriceTypeChange = (e) => {
    const isFixed = e.target.checked;
    setInfo("fixed", isFixed);
    handleStepsTypeChange(isFixed);
  };

  // console.log("INFO", info);
  // console.log("Service", service);

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
                onChange={(formattedValue) =>
                  setInfo("description", formattedValue)
                }
              />
            </div>
          </div>
          <div className="row">
            <div className="col-sm-6">
              <div className="mb20">
                {/* <SelectInput
                  type="object"
                  id="service-category"
                  name="service-category"
                  label="Κατηγορία"
                  errors={errors}
                  data={categoryOptions}
                  value={info.category.title}
                  onSelect={({ id, title }) =>
                    setInfo("category", { id, title })
                  }
                /> */}
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
                  // value={locationOptions}
                  onSelect={({ id, title }) =>
                    setInfo("category", { id, title })
                  }
                  capitalize
                />
              </div>
            </div>
            <div className="col-sm-6">
              <div className="mb20">
                <SelectInputMultiple
                  options={skillOptions}
                  id="service-skills"
                  name="service-skills"
                  label="Δεξιότητες"
                  errors={errors}
                  value={info.skills}
                  onSelect={(formattedArray) =>
                    setInfo("skills", formattedArray)
                  }
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
                    checked={info.fixed}
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
                  value={info.price}
                  onChange={(formattedValue) =>
                    setInfo("price", formattedValue)
                  }
                  className="form-control input-group"
                  errors={errors}
                  disabled={info.fixed === true}
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
                  label="Χρόνος Παράδωσης"
                  type="number"
                  min={1}
                  append="Μέρες"
                  value={info.time}
                  onChange={(formattedValue) => setInfo("time", formattedValue)}
                  className="form-control input-group"
                  errors={errors}
                  formatSymbols
                />
              </div>
            </div>
          </div>
          <div className="col-sm-6">
            <div className="mb20">
              <SelectInputSearch
                type="object"
                id="service-location"
                name="service-location"
                label="Περιοχή"
                labelPlural="περιοχές"
                query="location"
                errors={errors}
                isSearchable={true}
                options={locationOptions}
                // value={locationOptions}
                onSelect={({ id, title }) => setInfo("location", { id, title })}
                capitalize
              />
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
