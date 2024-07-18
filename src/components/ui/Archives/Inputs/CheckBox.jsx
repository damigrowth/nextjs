"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";

export default function CheckBox({ options, paramName }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getInitialParamsValue = () => {
    const paramValue = searchParams.get(paramName);
    return paramValue ? paramValue.split(",") : [];
  };

  const [checkedValues, setCheckedValues] = useState(getInitialParamsValue);

  useEffect(() => {
    const paramValue = searchParams.get(paramName);
    setCheckedValues(paramValue ? paramValue.split(",") : []);
  }, [searchParams, paramName]);

  const handleChange = (value) => {
    const newCheckedValues = checkedValues.includes(String(value))
      ? checkedValues.filter((v) => v !== String(value))
      : [...checkedValues, String(value)];

    setCheckedValues(newCheckedValues);

    const params = new URLSearchParams(searchParams.toString());
    if (newCheckedValues.length > 0) {
      params.set(paramName, newCheckedValues.join(","));
    } else {
      params.delete(paramName);
    }
    params.set("page", 1);
    router.push(pathname + "?" + params.toString(), { scroll: false });
  };

  return (
    <div className="card-body card-body px-0 pt-0">
      <div className="checkbox-style1 mb15">
        {options.map((option, i) => (
          <label key={i} className="custom_checkbox">
            {option.label}
            <input
              type="checkbox"
              name={`checkbox-${paramName}-${i}`}
              checked={checkedValues.includes(String(option.value))}
              onChange={() => handleChange(option.value)}
            />
            <span className="checkmark" />
            {/* <span className="right-tags">({item.total})</span> */}
          </label>
        ))}
      </div>
    </div>
  );
}
