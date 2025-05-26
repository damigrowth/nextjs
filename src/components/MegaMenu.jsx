"use client";

import React, { useRef, useState } from "react";
import MegaMenuPillar from "./MegaMenuPillar";
import { useClickOutside } from "@/hook/useClickOutside";
import Link from "next/link";

export default function MegaMenu({ categories, staticMenuClass }) {
  const [isActive, setIsActive] = useState(false);

  const handleMenuClick = () => {
    setIsActive((prev) => !prev);
  };

  const handleCloseDropdown = () => {
    setIsActive(false);
  };

  const inputRef = useRef();
  useClickOutside(inputRef, handleCloseDropdown);

  return (
    <>
      <div id="mega-menu" onClick={handleMenuClick}>
        <a
          className={`btn-mega fw500 ${
            staticMenuClass ? staticMenuClass : ""
          } `}
        >
          <span
            className={`pl30 pl10-xl pr5 fz15 vam flaticon-menu ${
              staticMenuClass ? staticMenuClass : ""
            } `}
          />
          Κατηγορίες
        </a>
        <ul ref={inputRef} className={`menu pl0 ${isActive ? "active" : ""}`}>
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/categories/${category.slug}`}
                className="dropdown"
                prefetch={false}
              >
                <span className={`menu-icn ${category.icon}`} />
                <span className="menu-title">{category.label}</span>
              </Link>
              <div className="drop-menu">
                {category.subcategories.map((subcategory, i) => (
                  <div key={i}>
                    <MegaMenuPillar subcategory={subcategory} />
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
