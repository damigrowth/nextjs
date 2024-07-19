"use client";

import { useEffect, useOptimistic, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import BorderSpinner from "../../Spinners/BorderSpinner";

export default function SearchSelectSingle({
  defaultLabel,
  paramOptionName,
  paramSearchName,
  options,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Add default option
  const allOptions = [{ value: "", label: defaultLabel }, ...options];

  // Initialize search state from search parameters or default value
  const getInitialSearch = () => searchParams.get(paramSearchName) || "";
  const [search, setSearch] = useOptimistic(getInitialSearch());

  // Initialize selected option state from search parameters or default value
  const getInitialSelectedOption = () => {
    const initialSelectedOptionValue = searchParams.get(paramOptionName);
    return (
      allOptions.find((opt) => opt.value === initialSelectedOptionValue) ||
      allOptions[0]
    );
  };
  const [selectedOption, setSelectedOption] = useOptimistic(
    getInitialSelectedOption()
  );

  const [isPending, startTransition] = useTransition();
  const [isSearchPending, startSearchTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      setSearch(getInitialSearch());
      setSelectedOption(getInitialSelectedOption());
    });
  }, [searchParams, paramSearchName, paramOptionName]);

  const selectHandler = (data) => {
    startTransition(() => {
      setSelectedOption(data);
      const params = new URLSearchParams(searchParams.toString());
      if (data.value === "") {
        params.delete(paramOptionName);
        params.delete(paramSearchName);
      } else {
        params.set(paramOptionName, data.value);
        params.delete(paramSearchName);
      }
      params.set("page", 1);

      router.push(pathname + "?" + params.toString(), { scroll: false });
    });
  };

  const searchHandler = (text) => {
    startSearchTransition(() => {
      setSearch(text);
      const params = new URLSearchParams(searchParams.toString());
      params.set(paramSearchName, text);
      params.set("page", 1);

      router.replace(pathname + "?" + params.toString(), { scroll: false });
    });
  };

  const searchFilter = (item) =>
    item.label.toLowerCase().includes(search.toLowerCase());

  const content = allOptions.filter(searchFilter).map((item, i) => (
    <li
      key={i}
      name={`select-${paramOptionName}-${i}`}
      className={`dropdown-item ${
        selectedOption.label === item.label ? "selected active" : ""
      }`}
      onClick={() => {
        selectHandler(item);
        setSearch("");
      }}
    >
      <a>
        <span className="text">{item.label}</span>
      </a>
    </li>
  ));

  return (
    <div
      data-pending={isPending ? "" : undefined}
      search-pending={isSearchPending ? "" : undefined}
      className="card-body card-body px-0 pt-0"
    >
      <div className="form-style1 ">
        <div className="bootselect-multiselect">
          <div className="dropdown bootstrap-select">
            <button
              type="button"
              className="btn dropdown-toggle btn-light"
              data-bs-toggle="dropdown"
            >
              <div className="filter-option">
                <div className="filter-option-inner">
                  <div className="filter-option-inner-inner">
                    {selectedOption.label}
                  </div>
                </div>
              </div>
            </button>
            <div className="dropdown-menu">
              <div className="bs-searchbox">
                <input
                  type="search"
                  onChange={(e) => searchHandler(e.target.value)}
                  className="form-control"
                  value={search}
                />
              </div>
              <div className="inner show position-relative">
                <BorderSpinner
                  width="1rem"
                  height="1rem"
                  borderWidth="0.3rem"
                  className="search-content-spinner"
                />
                <ul
                  className="dropdown-menu inner show search-loading-element"
                  style={{
                    overflowY: "auto",
                    maxHeight: "250px",
                    minHeight: "auto",
                  }}
                >
                  {content.length !== 0 ? (
                    content
                  ) : (
                    <li className="no-results">
                      {isSearchPending ? "" : `Κανένα αποτέλεσμα για ${search}`}
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
