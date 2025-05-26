'use client';

import React, { useState } from 'react';

import { formatInput } from '@/utils/InputFormats/formats';

/**
 * A reusable input component with built-in formatting and validation handling.
 * Handles type conversion for numeric inputs and enforces min/max on blur.
 *
 * @param {object} props - The component props.
 * @param {string} props.label - The label text for the input field.
 * @param {string} props.type - The input type (e.g., 'text', 'number', 'email', 'tel', 'url').
 * @param {number} [props.min] - The minimum allowed value (for type='number').
 * @param {number} [props.max] - The maximum allowed value (for type='number').
 * @param {number} [props.minLength] - The minimum allowed length (for text types).
 * @param {number} [props.maxLength] - The maximum allowed length.
 * @param {string} [props.placeholder] - The placeholder text.
 * @param {string} props.id - The unique ID for the input element.
 * @param {string|number} props.value - The current value of the input.
 * @param {string} props.name - The name attribute for the input element.
 * @param {boolean} [props.hideLabel] - If true, hides the label visually (still accessible).
 * @param {string} [props.autoComplete] - The autocomplete attribute value.
 * @param {boolean} [props.formatNumbers] - If true, removes numbers from the input.
 * @param {boolean} [props.formatSpaces] - If true, removes spaces from the input.
 * @param {boolean} [props.formatSymbols] - If true, removes symbols (keeps alphanumeric and Greek).
 * @param {boolean} [props.capitalize] - If true, capitalizes the first letter.
 * @param {boolean} [props.lowerCase] - If true, converts the input to lowercase.
 * @param {string} [props.append] - Text or element to append within the input group.
 * @param {boolean} [props.disabled] - If true, disables the input field.
 * @param {object|string} [props.errors] - Error object or string for displaying validation errors.
 * @param {function(string|number): void} props.onChange - Callback function triggered on input value change. Receives the formatted value (integer or empty string for number, string otherwise).
 * @param {string} [props.className] - Additional CSS classes for the input element.
 * @param {string} [icon] - CSS class for an optional icon to display before the label.
 * @returns {JSX.Element} The InputB component.
 */
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
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Handles the input change event.
   * Formats the raw input value based on props.
   * For numeric types, calls onChange with either an integer or an empty string.
   * For other types, calls onChange with the formatted string.
   * @param {React.ChangeEvent<HTMLInputElement>} event - The input change event.
   */
  const handleInputChange = (event) => {
    const rawValue = event.target.value;

    const formattedValue = formatInput({
      value: rawValue,
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

    if (type === 'number') {
      if (formattedValue === '') {
        onChange('');
      } else {
        const integerVal = parseInt(formattedValue, 10);

        onChange(isNaN(integerVal) ? '' : integerVal);
      }
    } else {
      onChange(formattedValue);
    }
  };

  /**
   * Handles the input blur event, primarily for number inputs.
   * Validates the current value against min/max constraints.
   * Calls onChange with the final, validated integer value to ensure the parent state is correct.
   * @param {React.FocusEvent<HTMLInputElement>} event - The input blur event.
   */
  const handleBlur = (event) => {
    if (type === 'number') {
      const currentValue = event.target.value;

      let numericValue = parseInt(currentValue, 10);

      if (isNaN(numericValue) || event.target.value.trim() === '') {
        numericValue = NaN;
      }

      let finalValue = numericValue;

      if (min !== undefined && min !== null) {
        if (isNaN(numericValue) || numericValue < min) {
          finalValue = min;
        }
      } else if (isNaN(numericValue)) {
        finalValue = 0;
      }
      if (
        max !== undefined &&
        max !== null &&
        !isNaN(numericValue) &&
        numericValue > max
      ) {
        finalValue = max;
      }

      const finalIntegerValue = parseInt(finalValue, 10);

      if (!isNaN(finalIntegerValue)) {
        onChange(finalIntegerValue);
      } else if (min !== undefined && min !== null) {
        onChange(parseInt(min, 10));
      } else {
        onChange(0);
      }
    }
  };

  return (
    <div className='mb10'>
      {hideLabel === undefined && (
        <label htmlFor={id} className='form-label fw500 dark-color'>
          {icon && <span className={`pr10 ${icon}`} />}
          {label}
        </label>
      )}
      <div className='input-group position-relative'>
        <input
          type={
            type === 'password' ? (showPassword ? 'text' : 'password') : type
          }
          id={id}
          name={name}
          min={min}
          max={max}
          minLength={minLength}
          maxLength={maxLength}
          placeholder={placeholder}
          value={value === null || value === undefined ? '' : String(value)}
          autoComplete={autoComplete}
          disabled={disabled}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className={className}
          inputMode={type === 'number' ? 'decimal' : 'text'}
          pattern={type === 'number' ? '[0-9]*' : undefined}
        />
        {type === 'password' && (
          <button
            type='button'
            className='password-toggle'
            onClick={() => setShowPassword(!showPassword)}
            style={{
              /* Basic styling, adjust as needed */ position: 'absolute',
              right: append ? '50px' : '10px', // Adjust if there's an append
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.375rem 0.75rem', // Match form-control padding
              zIndex: 3, // Ensure it's above the input
            }}
          >
            <i
              className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}
            ></i>
          </button>
        )}
        {append && <span className='input-group-text'>{append}</span>}
      </div>
      {errors && (
        <div>
          <p className='text-danger mb0 pb0'>
            {typeof errors === 'string' ? errors : errors.message}
          </p>
        </div>
      )}
    </div>
  );
}
