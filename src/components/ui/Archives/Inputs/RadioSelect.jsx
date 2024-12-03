"use client";

import React from "react";

export default function RadioSelect({
  id,
  name,
  options,
  value,
  onChange,
  error,
}) {
  return (
    <div className="card-body card-body px-0 pt-0">
      <div className="radiobox-style1">
        <div className="radio-element">
          {options.map((option, i) => {
            const isChecked = value === option.value;
            return (
              <label
                key={i}
                className="form-check d-flex align-items-center mb15"
                style={{ cursor: "pointer" }}
              >
                <input
                  id={id + "-" + option.value}
                  name={name}
                  className="form-check-input"
                  type="radio"
                  checked={isChecked}
                  value={option.value}
                  onChange={(e) => onChange(e)}
                  style={{
                    marginTop: "0px",
                    borderWidth: isChecked ? "4.5px" : "1px",
                    backgroundImage: "none",
                    backgroundColor: "transparent",
                  }}
                />
                <span
                  className="form-check-label"
                  htmlFor={id + "-" + option.value}
                >
                  {option.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>
      {error && <div className="mt10 text-danger">{error}</div>}
    </div>
  );
}
