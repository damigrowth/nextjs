"use client";

import { memo } from "react";

const SwitchB = memo(function SwitchB({
  label,
  initialValue,
  onChange,
  activeText,
  inactiveText,
  id = "flexSwitchCheckDefault",
}) {
  const handleChange = (e) => {
    if (onChange) {
      // Pass the actual checked value from the event
      onChange(e.target.checked);
    }
  };

  return (
    <div className="card-body card-body px-0 pt-0">
      <div className="switch-style1">
        <label
          className="form-label fw500 dark-color"
          htmlFor={id}
        >
          {label}
        </label>
        <div className="form-check form-switch mb20">
          <input
            className="form-check-input mt-0"
            type="checkbox"
            id={id}
            checked={initialValue}
            onChange={handleChange}
          />
          <label
            className="form-check-label mt-0"
            htmlFor={id}
          >
            {initialValue ? activeText : inactiveText}
          </label>
        </div>
      </div>
    </div>
  );
});

export default SwitchB;

