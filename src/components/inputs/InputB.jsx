"use client";

import React from "react";
import { formatInput } from "@/utils/InputFormats/formats";

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
  icon,
}) {
  const handleInputChange = (event) => {
    const formattedValue = formatInput({
      value: event.target.value,
      type,
      maxLength,
      formatNumbers,
      formatSpaces,
      formatSymbols,
      capitalize,
      lowerCase,
    });

    onChange(formattedValue);
  };

  // For number inputs, use type="text" but with number-specific handling
  const inputType = type === "number" ? "text" : type;

  return (
    <div className="mb10">
      {hideLabel === undefined && (
        <label htmlFor={id} className="form-label fw500 dark-color">
          {icon && <span className={`pr10 ${icon}`} />}
          {label}
        </label>
      )}
      <div className="input-group">
        <input
          type={inputType}
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
          inputMode={type === "number" ? "numeric" : "text"}
          pattern={type === "number" ? "[0-9]*" : undefined}
        />
        {append && <span className="input-group-text">{append}</span>}
      </div>
      {errors?.field === name ? (
        <div>
          <p className="text-danger mb0 pb0">{errors.message}</p>
        </div>
      ) : null}
    </div>
  );
}
