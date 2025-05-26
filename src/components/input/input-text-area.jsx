'use client';

import React, { useState } from 'react';

import {
  capitalizeFirstLetter,
  cutNumbers,
  cutSpaces,
  cutSymbols,
  restrictCapitalLetters,
} from '@/utils/InputFormats/formats';

export default function TextArea({
  label,
  placeholder,
  id,
  value,
  name,
  rows,
  hideLabel,
  formatNumbers,
  formatSpaces,
  formatSymbols,
  capitalize,
  lowerCase,
  disabled,
  draggable,
  minLength,
  maxLength,
  counter,
  errors,
  zod,
  onChange,
  className,
}) {
  const [charCount, setCharCount] = useState(value ? value.length : 0);

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
    onChange(formattedValue);
    if (counter) {
      // Set character count
      setCharCount(formattedValue.length);
    }
  };

  const fieldError = errors?.field === name ? errors?.message : null;

  const nameError = errors?.[name] ? errors[name] : null;

  return (
    <>
      {hideLabel === undefined && (
        <label htmlFor={id} className='heading-color ff-heading fw500 mb10'>
          {label}
        </label>
      )}
      <div className='d-flex flex-column'>
        <div className='position-relative'>
          <textarea
            id={id}
            name={name}
            minLength={minLength}
            maxLength={maxLength}
            rows={rows}
            placeholder={placeholder}
            value={value}
            disabled={disabled}
            draggable={draggable}
            onChange={handleInputChange}
            style={{ resise: 'none' }}
            className={className}
          />
          {counter && (
            <p className='counter'>
              {charCount} / {maxLength}
            </p>
          )}
        </div>
        {(fieldError || nameError) && (
          <div>
            <p className='text-danger text-sm'>{fieldError || nameError}</p>
          </div>
        )}
      </div>
      {/* {state?.errors?.[id] ? (
        <div id={errorId} aria-live="polite" className="mt2 text-sm ">
          <p key={state.errors[id][0]} className="text-danger ">
            {state.errors[id][0]}
          </p>
        </div>
      ) : null} */}
    </>
  );
}
