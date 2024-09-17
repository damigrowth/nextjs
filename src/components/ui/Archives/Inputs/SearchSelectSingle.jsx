"use client";

import React, { useEffect, useOptimistic, useTransition } from "react";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import BorderSpinner from "../../Spinners/BorderSpinner";
import Link from "next/link";
import { getPathname } from "@/utils/paths";

export default function SearchSelectSingle({
  rootLabel,
  defaultLabel,
  paramOptionName,
  paramSearchName,
  paramDisabledName,
  options,
  navigates,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();

  // Route segments
  const root = getPathname(pathname, 0);
  const parent = getPathname(pathname, 1);
  const child = getPathname(pathname, 2);
  const last = getPathname(pathname, 3);

  const rootOption = { value: "", label: rootLabel };
  const defaultOption = { value: "default", label: defaultLabel };

  // Include rootOption and defaultOption in allOptions, but only rootOption in filterableOptions
  const allOptions = [rootOption, defaultOption, ...options];
  const filterableOptions = [rootOption, ...options];

  const getInitialSearch = () => searchParams.get(paramSearchName) || "";
  const [search, setSearch] = useOptimistic(getInitialSearch());

  // Initial Option
  const getInitialSelectedOption = () => {
    const searchParamValue = searchParams.get(paramOptionName);

    if (searchParamValue) {
      return (
        allOptions.find((opt) => opt.value === child || opt.value === last) ||
        defaultOption
      );
    }

    if (last) {
      return allOptions.find((opt) => opt.value === last) || defaultOption;
    }

    if (child) {
      return allOptions.find((opt) => opt.value === child) || defaultOption;
    }

    return defaultOption;
  };

  const [selectedOption, setSelectedOption] = useOptimistic(
    getInitialSelectedOption()
  );

  const getInitialSelectedLink = () => {
    if (last) {
      return allOptions.find((opt) => opt.value === last) || defaultOption;
    }

    if (child) {
      return allOptions.find((opt) => opt.value === child) || defaultOption;
    }

    return defaultOption;
  };

  const [selectedLink, setSelectedLink] = useOptimistic(
    getInitialSelectedLink()
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
      if (data.value === "" || data.value === "default") {
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

  const isDisabled = () => searchParams.has(paramDisabledName);

  const searchFilter = (item) =>
    item?.label?.toLowerCase().includes(search.toLowerCase());

  const listFilters = filterableOptions.filter(searchFilter).map((item, i) => (
    <li
      key={i}
      name={`select-${paramOptionName}-${i}`}
      className={`dropdown-item ${
        selectedOption?.label === item?.label ? "selected active" : ""
      }`}
      onClick={() => {
        selectHandler(item);
        setSearch("");
      }}
    >
      <a>
        <span className="text">{item?.label}</span>
      </a>
    </li>
  ));
  const generateLink = (value) => {
    if (value === "" || value === "default") {
      // If value is empty or default, return to the root
      return `/${root}`;
    }

    let newPath;

    switch (root) {
      case "pros":
      case "companies":
        // Both "pros" and "companies" have fewer segments (parent, child)
        if (!parent) {
          // If no parent, use root and value as parent
          newPath = `/${root}/${value}`;
        } else if (!child) {
          // If no child, use root, parent, and value as child
          newPath = `/${root}/${parent}/${value}`;
        } else {
          // If child exists, replace child with value (no deeper nesting)
          newPath = `/${root}/${parent}/${value}`;
        }
        break;

      case "ipiresies":
        // "ipiresies" allows deeper nesting with more segments (parent, child, last)
        if (!parent) {
          // If no parent, use root and value as parent
          newPath = `/${root}/${value}`;
        } else if (!child) {
          // If no child, use root, parent, and value as child
          newPath = `/${root}/${parent}/${value}`;
        } else if (!last) {
          // If no last, use root, parent, child, and value as last
          newPath = `/${root}/${parent}/${child}/${value}`;
        } else {
          // If all segments are present, replace the last with value
          newPath = `/${root}/${parent}/${child}/${value}`;
        }
        break;

      default:
        // Handle cases where root doesn't match "pros", "companies", or "ipiresies"
        newPath = `/${root}`;
        break;
    }

    const queryString = searchParams.toString();
    return `${newPath}${queryString ? `?${queryString}` : ""}`;
  };

  const selectLinkHandler = (item) => {
    setSelectedLink(item);
  };

  const listLinks = filterableOptions.filter(searchFilter).map((item, i) => (
    <li
      key={i}
      name={`select-${item.value}-${i}`}
      className={`dropdown-item p0 ${
        params.category === item.value ? "selected active" : ""
      }`}
      onClick={() => selectLinkHandler(item)}
    >
      <Link
        href={generateLink(item.value)}
        className="archive-search-select-list-link"
      >
        <span className="text">{item.label}</span>
      </Link>
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
              disabled={isDisabled()}
            >
              <div className="filter-option">
                <div className="filter-option-inner">
                  <div className="filter-option-inner-inner">
                    {navigates ? selectedLink.label : selectedOption.label}
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
                  {navigates ? (
                    listLinks.length !== 0 ? (
                      listLinks
                    ) : (
                      <li className="no-results">
                        {isSearchPending
                          ? ""
                          : `Κανένα αποτέλεσμα για ${search}`}
                      </li>
                    )
                  ) : listFilters.length !== 0 ? (
                    listFilters
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
