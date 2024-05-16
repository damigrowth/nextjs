"use client";

import { formatInput } from "@/utils/InputFormats/formats";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

import Select from "react-select";
import { useDebouncedCallback } from "use-debounce";

export default function SelectInputSearch({
  options,
  name,
  query,
  isMulti,
  label,
  errors,
  labelPlural,
  defaultValue,
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

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((value) => {
    if (!isMulti) {
      const formattedValue = formatInput({ value, capitalize });
      setTerm(formattedValue);

      const params = new URLSearchParams(searchParams);
      if (term) {
        params.set(query, formattedValue);
      } else {
        params.delete(query);
      }

      replace(`${pathname}?${params.toString()}`, { scroll: false });
    } else {
      setTerm(value);
    }
  }, 150);

  const handleSelect = (option) => {
    if (isMulti) {
      const formattedOptions = options.map((option) => ({
        id: option.value,
        title: option.label,
      }));
      onSelect(formattedOptions);
    } else {
      const formattedOption = {
        id: option.value,
        title: option.label,
      };

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
      {errors?.field === name ? (
        <div>
          <p className="text-danger">{errors.message}</p>
        </div>
      ) : null}
    </fieldset>
  ) : null;
}
