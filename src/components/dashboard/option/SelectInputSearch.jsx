"use client";

import { formatInput } from "@/utils/InputFormats/formats";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useDebouncedCallback } from "use-debounce";

export default function SelectInputSearch({
  options,
  name,
  value,
  isMulti,
  label,
  errors,
  labelPlural,
  defaultValue,
  onSearch,
  onSelect,
  isDisabled,
  isLoading,
  isClearable,
  isSearchable,
  formatNumbers,
  formatSpaces,
  formatSymbols,
  capitalize,
  lowerCase,
}) {
  const id = Date.now().toString();
  const [isMounted, setIsMounted] = useState(false);
  const [term, setTerm] = useState(defaultValue);

  const handleSearch = useDebouncedCallback((value) => {
    if (!isMulti) {
      const formattedValue = formatInput({ value, capitalize });
      setTerm(formattedValue);
      if (onSearch) {
        onSearch(formattedValue);
      }
    } else {
      setTerm(value);
      if (onSearch) {
        onSearch(value); // Added this line to trigger search for multi-select
      }
    }
  }, 150);

  const handleSelect = (option) => {
    if (isMulti) {
      const formattedOptions = option.map((opt) => ({
        id: opt.value,
        label: opt.label,
      }));
      onSelect(formattedOptions);
    } else {
      const formattedOption = option
        ? {
            id: option.value,
            label: option.label,
          }
        : null;
      onSelect(formattedOption);
    }
  };

  useEffect(() => setIsMounted(true), []);

  return isMounted ? (
    <fieldset className="form-style1">
      <label className="heading-color ff-heading fw500 mb10">{label}</label>
      <Select
        id={id}
        name={name}
        options={options}
        value={
          isMulti
            ? value
            : value.id === 0
            ? { id: 0, label: "Επιλογή..." }
            : value
        }
        defaultValue={term}
        isMulti={isMulti}
        isDisabled={isDisabled}
        isLoading={isLoading}
        isClearable={isClearable}
        isSearchable={isSearchable}
        inputValue={!isMulti ? term : undefined}
        onInputChange={(newValue) => {
          handleSearch(newValue);
        }}
        onChange={(newValue) => {
          handleSelect(newValue);
        }}
        placeholder="Επιλογή..."
        noOptionsMessage={() => `Δεν βρέθηκαν ${labelPlural}`}
        classNamePrefix="select"
        className={
          isMulti
            ? "basic-multi-select select-input"
            : "basic-single select-input"
        }
      />
      {errors?.field === name && (
        <div>
          <p className="text-danger">{errors.message}</p>
        </div>
      )}
    </fieldset>
  ) : null;
}
