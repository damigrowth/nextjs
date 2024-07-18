"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function SortOptions({ sortOptions }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedOptionValue = searchParams.get("sort") || sortOptions[0].value;

  const selectHandler = (data) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", data.value);
    params.set("page", 1);
    router.push(pathname + "?" + params, {
      scroll: false,
    });
  };

  return (
    <div className="pcs_dropdown dark-color pr10 pr0-xs text-center">
      <span>Ταξινόμηση κατά</span>
      <div className="dropdown bootstrap-select show-tick">
        <button
          type="button"
          className="btn dropdown-toggle btn-light"
          data-bs-toggle="dropdown"
        >
          <div className="filter-option">
            <div className="filter-option-inner">
              <div className="filter-option-inner-inner">
                {sortOptions.find(
                  (option) => option.value === selectedOptionValue
                )?.label || sortOptions[0].label}
              </div>
            </div>
          </div>
        </button>
        <div className="dropdown-menu" style={{ width: "220px" }}>
          <div className="inner show">
            <ul className="dropdown-menu inner show">
              {sortOptions.map((option, i) => (
                <li key={i}>
                  <a
                    onClick={() => selectHandler(option)}
                    className={`dropdown-option ${
                      option.value === selectedOptionValue
                        ? "active selected"
                        : ""
                    }`}
                  >
                    <span className="bs-ok-default check-mark" />
                    <span className="text">{option.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
