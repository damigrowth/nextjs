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
      min,
      max,
      maxLength,
      formatNumbers,
      formatSpaces,
      formatSymbols,
      capitalize,
      lowerCase,
    });

    onChange(formattedValue);
  };

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
          inputMode={type === "number" ? "numeric" : "text"}
          pattern={type === "number" ? "[0-9]*" : undefined}
        />
        {append && <span className="input-group-text">{append}</span>}
      </div>
      {errors && (
        <div>
          <p className="text-danger mb0 pb0">
            {typeof errors === 'string' ? errors : errors.message}
          </p>
        </div>
      )}
    </div>
  );
}
