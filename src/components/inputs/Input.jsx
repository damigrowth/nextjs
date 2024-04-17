"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  capitalizeFirstLetter,
  cutNumbers,
  cutSpaces,
  cutSymbols,
  restrictCapitalLetters,
} from "@/utils/InputFormats/formats";

import ReactInputMask from "react-input-mask";
import { useFormStatus } from "react-dom";

export default function Input({
  state,
  action,
  label,
  type,
  min,
  max,
  placeholder,
  id,
  value,
  defaultValue,
  name,
  hideLabel,
  autoComplete,
  errorId,
  formatNumbers,
  formatSpaces,
  formatSymbols,
  capitalize,
  lowerCase,
  append,
}) {
  const { pending } = useFormStatus();

  //? Capitalize first letters and only digits inputs

  const [inputValue, setInputValue] = useState(value || defaultValue);

  const handleInputChange = (event) => {
    let formattedValue = event.target.value;

    if (formatNumbers) {
      formattedValue = cutNumbers(formattedValue);
    }
    if (formatSymbols) {
      formattedValue = cutSymbols(formattedValue);
    }
    if (formatSpaces) {
      formattedValue = cutSpaces(formattedValue);
    }
    if (capitalize) {
      formattedValue = capitalizeFirstLetter(formattedValue);
    }
    if (lowerCase) {
      formattedValue = restrictCapitalLetters(formattedValue);
    }

    setInputValue(formattedValue);
  };

  return (
    <>
      {hideLabel === undefined && (
        <label htmlFor={id} className="form-label fw500 dark-color">
          {label}
        </label>
      )}

      <div className="input-group">
        <input
          type={type}
          min={min}
          max={max}
          placeholder={placeholder}
          id={id}
          value={inputValue}
          defaultValue={defaultValue}
          name={name}
          className="form-control"
          autoComplete={autoComplete}
          disabled={pending}
          onChange={handleInputChange}
        />
        {append && <span className="input-group-text">{append}</span>}
      </div>
      {state?.errors?.[id] ? (
        <div id={errorId} aria-live="polite" className="mt2 text-sm ">
          <p key={state.errors[id][0]} className="text-danger ">
            {state.errors[id][0]}
          </p>
        </div>
      ) : null}
    </>
  );
}
