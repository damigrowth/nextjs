"use client";

import { useState, useEffect } from "react";

export default function SwitchB({
  label,
  initialValue,
  onChange,
  activeText,
  inactiveText,
}) {
  const [isActive, setIsActive] = useState(initialValue);

  useEffect(() => {
    setIsActive(initialValue);
  }, [initialValue]);

  const handleSwitchChange = () => {
    const newValue = !isActive;
    setIsActive(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className="card-body card-body px-0 pt-0">
      <div className="switch-style1">
        <label
          className="form-label fw500 dark-color"
          htmlFor="flexSwitchCheckDefault"
        >
          {label}
        </label>
        <div className="form-check form-switch mb20">
          <input
            className="form-check-input mt-0"
            type="checkbox"
            id="flexSwitchCheckDefault"
            checked={isActive}
            onChange={handleSwitchChange}
          />
          <label
            className="form-check-label mt-0"
            htmlFor="flexSwitchCheckDefault"
          >
            {isActive ? activeText : inactiveText}
          </label>
        </div>
      </div>
    </div>
  );
}
