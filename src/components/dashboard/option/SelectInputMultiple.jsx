"use client";

import React, { useEffect, useState } from "react";

import Select from "react-select";

export default function SelectInputMultiple({
  options,
  name,
  label,
  errors,
  value,
  onSelect,
}) {
  const id = Date.now().toString();
  const [isMounted, setIsMounted] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleMultiSelect = (options) => {
    const formattedOptions = options.map((option) => ({
      id: option.value,
      title: option.label,
    }));
    onSelect(formattedOptions);
  };

  useEffect(() => setIsMounted(true), []);

  return isMounted ? (
    <fieldset className="form-style1">
      <label className="heading-color ff-heading fw500 mb10">{label}</label>
      <Select
        options={options}
        defaultValue={value}
        isMulti
        id={id}
        name={name}
        className="basic-multi-select select-input"
        classNamePrefix="select"
        placeholder="Επιλογή..."
        onChange={handleMultiSelect}
        // menuIsOpen={true}
      />
      {errors?.field === name ? (
        <div>
          <p className="text-danger">{errors.message}</p>
        </div>
      ) : null}
    </fieldset>
  ) : null;
}
