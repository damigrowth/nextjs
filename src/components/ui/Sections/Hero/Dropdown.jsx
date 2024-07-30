"use client";

import useHomeStore from "@/store/home/homeStore";

export default function Dropdown({ categories }) {
  const { categorySelect, setCategorySelect } = useHomeStore();
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
            {categories.map((category, index) => (
              <li
                onClick={() => setCategorySelect(category)}
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
