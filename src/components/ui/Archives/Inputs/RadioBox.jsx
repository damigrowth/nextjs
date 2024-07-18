"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function RadioBox({ options, paramName }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state from search parameters or default value
  const getInitialParamsValue = () => searchParams.get(paramName) || "";
  const [selectedValue, setSelectedValue] = useState(getInitialParamsValue);

  useEffect(() => {
    const paramValue = searchParams.get(paramName);
    setSelectedValue(paramValue || "");
  }, [searchParams, paramName]);

  const handleChange = (value) => {
    setSelectedValue(value);

    const params = new URLSearchParams(searchParams.toString());
    params.set(paramName, value);
    params.set("page", 1);

    router.push(pathname + "?" + params.toString(), {
      scroll: false,
    });
  };
  return (
    <div className="card-body card-body px-0 pt-0">
      <div className="radiobox-style1">
        <div className="radio-element">
          {options.map((option, i) => (
            <label
              key={i}
              className="form-check d-flex align-items-center mb15"
              style={{ cursor: "pointer" }}
            >
              <input
                className="form-check-input"
                type="radio"
                name={`radio-${paramName}`}
                id={`radio-${paramName}-${i}`}
                checked={selectedValue === String(option.value)}
                onChange={() => handleChange(String(option.value))}
                style={{ marginTop: "0px" }}
              />
              <span
                className="form-check-label"
                htmlFor={`flexRadioDefault1${i}`}
              >
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
