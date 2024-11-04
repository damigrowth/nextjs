"use client";

import { searchSubcategories } from "@/lib/search/subcategories";
import useHomeStore from "@/store/home/homeStore";
import HomeSchema from "@/utils/Seo/Schema/HomeSchema";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

// Debounce function to delay execution
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

export default function Search() {
  const router = useRouter();

  const [res, action, pending] = useActionState(searchSubcategories);

  const {
    searchTerm,
    setSearchTerm,
    categorySelect,
    isSearchDropdownOpen,
    focusDropdown,
    blurDropdown,
  } = useHomeStore();

  const categorySlug = categorySelect?.attributes?.slug || "";

  const formRef = useRef(null);

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!categorySlug) {
        router.push(`/ipiresies?search=${searchTerm}`);
      } else {
        router.push(`/ipiresies/${categorySlug}?search=${searchTerm}`);
      }
    }
  };

  // Debounced form submit
  const debouncedSubmit = useCallback(
    debounce(() => {
      if (formRef.current) {
        formRef.current.requestSubmit();
      }
    }, 1500),
    []
  );

  // Trigger form submit when input changes
  useEffect(() => {
    if (searchTerm !== "") {
      debouncedSubmit();
    }
  }, [searchTerm, debouncedSubmit]);

  return (
    <>
      <HomeSchema
        searchTarget={
          !categorySlug
            ? `/ipiresies?search=${searchTerm}`
            : `/ipiresies/${categorySlug}?search=${searchTerm}`
        }
        searchInput={`searchTerm`}
      />
      <form
        ref={formRef}
        action={action}
        className="form-search position-relative"
        autoComplete="off"
      >
        <div className="box-search">
          {pending ? (
            <div
              className="icon spinner-border spinner-border-sm"
              role="status"
              style={{ bottom: "20px" }}
            >
              <span className="sr-only"></span>
            </div>
          ) : (
            <span className="icon far fa-magnifying-glass" />
          )}

          <input
            type="hidden"
            id="category"
            name="category"
            value={JSON.stringify(categorySlug)}
          />
          <input
            type="text"
            id="searchTerm"
            name="searchTerm"
            placeholder="Τι υπηρεσία ψάχνετε;"
            className="form-control"
            onFocus={focusDropdown}
            onBlur={blurDropdown}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => handleSearch(e)}
          />
          {res?.data?.length > 0 && (
            <div
              className="search-suggestions"
              style={
                isSearchDropdownOpen
                  ? {
                      visibility: "visible",
                      opacity: "1",
                      top: "70px",
                    }
                  : {
                      visibility: "hidden",
                      opacity: "0",
                      top: "100px",
                    }
              }
            >
              {/* <h6 className="fz14 ml30 mt25 mb-3">Δημοφιλείς Αναζητήσεις</h6> */}

              <div className="box-suggestions">
                <ul className="px-0 m-0 pb-4">
                  {res.data.map((sub, index) => (
                    <li
                      key={index}
                      // className={searchTerm === item ? "ui-list-active" : ""}
                    >
                      <Link
                        // onClick={() => selectSearch(item)}
                        href={`/ipiresies/${sub.slug}`}
                        className="info-product"
                      >
                        <div className="item_title">{sub.label}</div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </form>
    </>
  );
}
