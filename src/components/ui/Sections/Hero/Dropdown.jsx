"use client";

import useHomeStore from "@/store/home/homeStore";
import { useRef } from "react";
import { searchSubcategories } from "@/lib/search/subcategories";

export default function Dropdown({ categories }) {
  const { categorySelect, setCategorySelect, setSearchTerm } = useHomeStore();

  const handleCategorySelect = (category) => {
    setSearchTerm(""); // Reset search term when category changes
    setCategorySelect(category); // This will trigger a search in Search.jsx due to categorySelect dependency
  };

  return (
    <div className="dropdown bootstrap-select">
      <button
        type="button"
        className="btn dropdown-toggle btn-light"
        data-bs-toggle="dropdown"
      >
        <div className="filter-option">
          <div className="filter-option-inner">
            <div className="filter-option-inner-inner">
              {categorySelect !== null
                ? categorySelect.attributes.label
                : "Κατηγορίες"}
            </div>
          </div>
        </div>
      </button>
      <div className="dropdown-menu">
        <div className="inner show">
          <ul className="dropdown-menu inner show">
            <li
              onClick={() => handleCategorySelect(null)}
              key="0"
              className="selected active"
            >
              <a
                className={`dropdown-item selected ${
                  categorySelect?.attributes?.slug === "" ? "active" : ""
                }`}
              >
                <span className="text">Όλες οι Κατηγορίες</span>
              </a>
            </li>
            {categories.map((category, index) => (
              <li
                onClick={() => handleCategorySelect(category)}
                key={index}
                className="selected active"
              >
                <a
                  className={`dropdown-item selected ${
                    categorySelect?.attributes?.slug ===
                    category.attributes.slug
                      ? "active"
                      : ""
                  }`}
                >
                  <span className="text">{category.attributes.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
