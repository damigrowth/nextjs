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
  onMenuScrollToBottom,
  isDisabled,
  isLoading,
  isClearable,
  isSearchable,
  formatNumbers,
  formatSpaces,
  formatSymbols,
  capitalize,
  lowerCase,
  defaultPlaceholder = "Επιλογή...",
  defaultEmptyMessage,
  customStyles,
  allowNewTerms = false,
  newTermValue = "new",
}) {
  const id = Date.now().toString();
  const [isMounted, setIsMounted] = useState(false);
  const [term, setTerm] = useState(defaultValue);
  const [newTerms, setNewTerms] = useState([]);

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
        onSearch(value);
      }
    }
  }, 150);

  const handleSelect = (option) => {
    if (!onSelect) return;

    if (isMulti) {
      const formattedOptions =
        option?.map((opt) => ({
          id: opt.value,
          label: opt.label,
          isNewTerm: opt.isNewTerm,
        })) || [];
      onSelect(formattedOptions);
    } else {
      const formattedOption = option
        ? {
            id: option.value,
            label: option.label,
            isNewTerm: option.isNewTerm,
          }
        : null;
      onSelect(formattedOption);
    }
  };

  const handleKeyDown = (event) => {
    if (
      !allowNewTerms ||
      !isMulti ||
      !term ||
      options.length > 0 ||
      event.key !== "Enter"
    )
      return;

    event.preventDefault();
    addNewTerm(term);
    setTerm("");
  };

  const handleBlur = () => {
    if (!allowNewTerms || !isMulti || !term || options.length > 0) return;

    addNewTerm(term);
  };

  const addNewTerm = (termValue) => {
    const newTerm = {
      value: newTermValue,
      label: termValue,
      isNewTerm: true,
    };

    setNewTerms((prev) => [...prev, newTerm]);
    setTerm("");

    const updatedValue = value ? [...value, newTerm] : [newTerm];
    handleSelect(updatedValue);
  };

  const handleMenuScroll = (event) => {
    const target = event.target;
    if (
      onMenuScrollToBottom &&
      target.scrollHeight - target.scrollTop === target.clientHeight
    ) {
      onMenuScrollToBottom();
    }
  };

  useEffect(() => setIsMounted(true), []);

  const defaultStyles = {
    control: (base) => ({
      ...base,
    }),
    multiValue: (base) => ({
      ...base,
      borderRadius: "8px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      fontSize: "15px",
      paddingLeft: "10px",
    }),
    valueContainer: (base) => ({
      ...base,
      paddingLeft: "0px",
    }),
    multiValueRemove: (base) => ({
      ...base,
      borderTopRightRadius: "8px",
      borderBottomRightRadius: "8px",
    }),
    menu: (base) => ({
      ...base,
      position: "absolute",
      width: "100%",
      zIndex: 2,
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: "200px",
    }),
  };

  return isMounted ? (
    <fieldset className="form-style1">
      {label && (
        <label className="heading-color ff-heading fw500 mb10">{label}</label>
      )}
      <Select
        id={id}
        name={name}
        options={[...options, ...newTerms]}
        value={value}
        defaultValue={term}
        isMulti={isMulti}
        isDisabled={isDisabled}
        isLoading={isLoading}
        isClearable={isClearable}
        isSearchable={isSearchable}
        inputValue={term}
        onInputChange={(newValue, { action }) => {
          if (action === "input-change") {
            setTerm(newValue);
            handleSearch(newValue);
          }
        }}
        onChange={handleSelect}
        onMenuScrollToBottom={onMenuScrollToBottom}
        placeholder={defaultPlaceholder}
        noOptionsMessage={() =>
          defaultEmptyMessage || `Δεν βρέθηκαν ${labelPlural}`
        }
        classNamePrefix="select"
        className={
          isMulti
            ? "basic-multi-select select-input"
            : "basic-single select-input"
        }
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        styles={customStyles || defaultStyles}
        components={{
          MenuList: ({ children, ...props }) => (
            <div {...props} onScroll={handleMenuScroll}>
              {children}
            </div>
          ),
        }}
      />
      {errors?.field === name && (
        <div>
          <p className="text-danger">{errors.message}</p>
        </div>
      )}
    </fieldset>
  ) : null;
}
