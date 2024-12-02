"use client";

import React from "react";

export default function CheckSelect({ options, values, onChange }) {
  const handleChange = (value) => {
    const newValues = values.includes(String(value))
      ? values.filter((v) => v !== String(value))
      : [...values, String(value)];
    
    onChange(newValues);
  };

  return (
    <div className="card-body card-body px-0 pt-0">
      <div className="checkbox-style1 mb15">
        {options.map((option, i) => (
          <label key={i} className="custom_filter_checkbox">
            {option.label}
            <input
              type="checkbox"
              name={`checkbox-consent-${i}`}
              checked={values.includes(String(option.value))}
              onChange={() => handleChange(option.value)}
            />
            <span className="checkmark" />
          </label>
        ))}
      </div>
    </div>
  );
}