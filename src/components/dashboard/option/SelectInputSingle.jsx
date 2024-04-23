"use client";

import React, { useEffect, useState } from "react";

import Select from "react-select";

export default ({
  options,
  name,
  label,
  errors,
  value,
  onSelect,
  isDisabled,
  isLoading,
  isClearable,
  isSearchable,
}) => {
  const id = Date.now().toString();
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleInputChange = (value) => {
    setSearchQuery(value);

    // locations?filters[area][$eq]=Αγιά
  };

  console.log(searchQuery);

  useEffect(() => setIsMounted(true), []);

  return isMounted ? (
    <fieldset className="form-style1">
      <label className="heading-color ff-heading fw500 mb10">{label}</label>
      <Select
        className="basic-single"
        classNamePrefix="select"
        // defaultValue={options[0]}
        isDisabled={isDisabled}
        isLoading={isLoading}
        isClearable={isClearable}
        isSearchable={isSearchable}
        name={name}
        options={options}
        id={id}
        placeholder="Επιλογή..."
        onInputChange={handleInputChange}
        // onChange={handleInputChange}
        // onKeyDown={handleInputChange}
        // onChange={(newValue) => {
        //   setSearchQuery(newValue);
        // }}
      />
      {errors?.field === name ? (
        <div>
          <p className="text-danger">{errors.message}</p>
        </div>
      ) : null}
    </fieldset>
  ) : null;
};
