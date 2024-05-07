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
  label,
  errors,
  labelPlural,
  value,
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
  const [term, setTerm] = useState("");

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((value) => {
    const formattedValue = formatInput({ value, capitalize });
    setTerm(formattedValue);

    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set(query, formattedValue);
    } else {
      params.delete(query);
    }

    replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, 150);

  const handleSelect = (option) => {
    // console.log("OPTION:", option);
    const formattedOption = {
      id: option.value,
      title: option.label,
    };
    onSelect(formattedOption);
  };

  console.log("OPTIONS", term);

  useEffect(() => setIsMounted(true), []);

  return isMounted ? (
    <fieldset className="form-style1">
      <label className="heading-color ff-heading fw500 mb10">{label}</label>
      <Select
        className="basic-single select-input"
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
        noOptionsMessage={() => `Δεν βρέθηκαν ${labelPlural}`}
        inputValue={term}
        // menuIsOpen={true}
        // onKeyDown={(newValue) => {
        //   handleSearch(newValue);
        // }}
        // value={term}
        onInputChange={(newValue) => {
          handleSearch(newValue);
        }}
        onChange={(newValue) => {
          handleSelect(newValue);
        }}
      />
      {errors?.field === name ? (
        <div>
          <p className="text-danger">{errors.message}</p>
        </div>
      ) : null}
    </fieldset>
  ) : null;
}
