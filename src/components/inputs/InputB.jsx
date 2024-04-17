"use client";

import React from "react";
import {
  capitalizeFirstLetter,
  cutNumbers,
  cutSpaces,
  cutSymbols,
  restrictCapitalLetters,
} from "@/utils/InputFormats/formats";

import ReactInputMask from "react-input-mask";

export default function InputB({
  label,
  type,
  min,
  max,
  minLength,
  maxLength,
  placeholder,
  id,
  value,
  name,
  hideLabel,
  autoComplete,
  formatNumbers,
  formatSpaces,
  formatSymbols,
  capitalize,
  lowerCase,
  append,
  disabled,
  errors,
  onChange,
  className,
}) {
  const handleInputChange = (event) => {
    let formattedValue = event.target.value;

    // Apply number formatting only if formatNumbers is true
    if (formatNumbers) {
      formattedValue = cutNumbers(formattedValue);
    }
    // Apply symbol formatting only if formatSymbols is true
    if (formatSymbols) {
      formattedValue = cutSymbols(formattedValue);
    }
    // Apply space formatting only if formatSpaces is true
    if (formatSpaces) {
      formattedValue = cutSpaces(formattedValue);
    }
    // Apply capitalization only if capitalize is true
    if (capitalize) {
      formattedValue = capitalizeFirstLetter(formattedValue);
    }
    // Apply lowercase restriction only if lowerCase is true
    if (lowerCase) {
      formattedValue = restrictCapitalLetters(formattedValue);
    }
    // Convert value to number only if type is "number"
    if (type === "number") {
      formattedValue = parseFloat(formattedValue);
    }

    // Call onChange callback with the formatted value
    onChange(formattedValue);
  };

  return (
    <>
      {hideLabel === undefined && (
        <label htmlFor={id} className="form-label fw500 dark-color">
          {label}
        </label>
      )}

      <div className="input-group pb10">
        <input
          type={type}
          id={id}
          name={name}
          min={min}
          max={max}
          minLength={minLength}
          maxLength={maxLength}
          placeholder={placeholder}
          value={value}
          autoComplete={autoComplete}
          disabled={disabled}
          onChange={handleInputChange}
          className={className}
        />
        {append && <span className="input-group-text">{append}</span>}
      </div>
      {errors?.field === name ? (
        <div>
          <p className="text-danger">{errors.message}</p>
        </div>
      ) : null}
    </>
  );
}
