"use client";

import useHomeStore from "@/store/home/homeStore";
import React from "react";

export default function CategoryTabs({ categories }) {
  const { featuredCategory, setFeaturedCategory } = useHomeStore();

  return (
    <ul className="nav nav-pills mb20 justify-content-xl-end" id="pills-tab">
      <li className="nav-item">
        <button
          onClick={() => setFeaturedCategory("")}
          className={`nav-link fw500 dark-color ${
            featuredCategory === "" ? "active" : ""
          }`}
        >
          Όλες οι Υπηρεσίες
        </button>
      </li>
      {categories.map((item, index) => (
        <li key={index} className="nav-item">
          <button
            onClick={() => setFeaturedCategory(item.attributes.slug)}
            className={`nav-link fw500 dark-color ${
              featuredCategory === item.attributes.slug ? "active" : ""
            }`}
          >
            {item.attributes.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
