'use client';

import React, { useState } from 'react';
import { useFormStatus } from 'react-dom';

import {
  capitalizeFirstLetter,
  cutNumbers,
  cutSpaces,
  cutSymbols,
  formatUsername,
  restrictCapitalLetters,
} from '@/utils/InputFormats/formats';

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
  englishOnly,
  usernameFormat,
  append,
}) {
  const { pending } = useFormStatus();

  const [inputValue, setInputValue] = useState(value || defaultValue);

  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (event) => {
    let formattedValue = event.target.value;

    // Apply username format first if specified
    if (usernameFormat) {
      formattedValue = formatUsername(formattedValue);
    }
    // Apply English-only filter if specified (maintaining backward compatibility)
    else if (englishOnly) {
      formattedValue = formatUsername(formattedValue);
    }
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
        <label htmlFor={id} className='form-label fw500 dark-color'>
          {label}
        </label>
      )}
      <div className='position-relative'>
        <input
          type={
            type === 'password' ? (showPassword ? 'text' : 'password') : type
          }
          min={min}
          max={max}
          placeholder={placeholder}
          id={id}
          value={inputValue || ''}
          defaultValue={defaultValue}
          name={name}
          className={`form-control ${state?.errors?.[id] ? 'border-danger' : ''}`}
          autoComplete={autoComplete}
          disabled={pending}
          onChange={handleInputChange}
        />
        {type === 'password' && (
          <button
            type='button'
            className='password-toggle'
            onClick={() => setShowPassword(!showPassword)}
          >
            <i
              className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}
            ></i>
          </button>
        )}
        {append && <span className='input-group-text'>{append}</span>}
      </div>
      {state?.errors?.[id] ? (
        <div
          id={errorId}
          aria-live='polite'
          className='position-absolute m-0 pb-0 fz12'
        >
          <p key={state.errors[id][0]} className='text-danger '>
            {state.errors[id][0]}
          </p>
        </div>
      ) : null}
    </>
  );
}
