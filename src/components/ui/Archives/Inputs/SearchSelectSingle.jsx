"use client";

import React, {
  useEffect,
  useRef,
  useOptimistic,
  useTransition,
  useState,
} from "react";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import Link from "next/link";
import { getPathname } from "@/utils/paths";
import { RotatingLines } from "react-loader-spinner";

export default function SearchSelectSingle({
  rootLabel,
  defaultLabel,
  paramOptionName,
  paramSearchName,
  paramPageName,
  paramPageSizeName,
  paramDisabledName,
  options,
  navigates,
  onSearch,
  pagination,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();

  const root = getPathname(pathname, 0);
  const parent = getPathname(pathname, 1);
  const child = getPathname(pathname, 2);
  const last = getPathname(pathname, 3);

  const rootOption = { value: "", label: rootLabel };
  const defaultOption = { value: "default", label: defaultLabel };

  const allOptions = [rootOption, defaultOption, ...options];
  const filterableOptions = [rootOption, ...options];

  const getInitialSearch = () => searchParams.get(paramSearchName) || "";
  const [search, setSearch] = useOptimistic(getInitialSearch());

  const getInitialSelectedOption = () => {
    const searchParamValue = searchParams.get(paramOptionName);

    if (searchParamValue) {
      return (
        allOptions.find((opt) => opt.value === searchParamValue) ||
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

  const [selectedLink, setSelectedLink] = useOptimistic(
    getInitialSelectedOption()
  );

  const [isPending, startTransition] = useTransition();
  const [isSearchPending, startSearchTransition] = useTransition();
  const [isLoadMorePending, startLoadMoreTransition] = useTransition();

  const dropdownRef = useRef(null);

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
      params.set(paramPageName, "1");

      router.push(pathname + "?" + params.toString(), { scroll: false });
    });
  };

  const searchHandler = (text) => {
    startSearchTransition(() => {
      setSearch(text);
      const params = new URLSearchParams(searchParams.toString());
      params.set(paramSearchName, text);
      params.set(paramPageName, "1");

      if (onSearch) {
        onSearch(
          text,
          1,
          parseInt(searchParams.get(paramPageSizeName) || "10")
        );
      } else {
        router.replace(pathname + "?" + params.toString(), { scroll: false });
      }
    });
  };

  const handleScroll = () => {
    if (dropdownRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = dropdownRef.current;
      if (
        scrollTop + clientHeight >= scrollHeight - 5 &&
        !isSearchPending &&
        !isLoadMorePending &&
        pagination &&
        pagination.page * pagination.pageSize < pagination.total
      ) {
        loadMore();
      }
    }
  };

  const loadMore = () => {
    startLoadMoreTransition(() => {
      const nextPage = (pagination?.page || 0) + 1;
      const currentPageSize = parseInt(
        searchParams.get(paramPageSizeName) || "10"
      );
      const newPageSize = Math.min(currentPageSize + 10, pagination.total);

      const params = new URLSearchParams(searchParams.toString());
      params.set(paramPageName, "1");
      params.set(paramPageSizeName, newPageSize.toString());

      if (onSearch) {
        onSearch(search, 1, newPageSize);
      } else {
        router.push(pathname + "?" + params.toString(), { scroll: false });
      }
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
        selectedOption?.value === item?.value ? "selected active" : ""
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
      return `/${root}`;
    }

    let newPath;

    switch (root) {
      case "pros":
      case "companies":
        if (!parent) {
          newPath = `/${root}/${value}`;
        } else if (!child) {
          newPath = `/${root}/${parent}/${value}`;
        } else {
          newPath = `/${root}/${parent}/${value}`;
        }
        break;

      case "ipiresies":
        if (!parent) {
          newPath = `/${root}/${value}`;
        } else if (!child) {
          newPath = `/${root}/${parent}/${value}`;
        } else if (!last) {
          newPath = `/${root}/${parent}/${child}/${value}`;
        } else {
          newPath = `/${root}/${parent}/${child}/${value}`;
        }
        break;

      default:
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
                <div className="search-content-spinner">
                  <RotatingLines
                    visible={isSearchPending}
                    height="25"
                    width="25"
                    color="grey"
                    strokeWidth="4"
                    animationDuration="0.65"
                    ariaLabel="rotating-lines-loading"
                    wrapperStyle={{}}
                    wrapperClass=""
                    className="search-content-spinner"
                  />
                </div>
                <ul
                  ref={dropdownRef}
                  className="dropdown-menu inner show search-loading-element"
                  style={{
                    overflowY: "auto",
                    maxHeight: "250px",
                    minHeight: "auto",
                  }}
                  onScroll={handleScroll}
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
                  {isLoadMorePending && (
                    <li className="text-center">
                      <RotatingLines
                        visible={true}
                        height="25"
                        width="25"
                        color="grey"
                        strokeWidth="4"
                        animationDuration="0.65"
                        ariaLabel="rotating-lines-loading"
                        wrapperStyle={{}}
                        wrapperClass=""
                        className="loading-more-spinner"
                      />
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
