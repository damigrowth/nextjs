"use client";

import React, { useRef, useState } from "react";
import MegaMenuPillar from "./MegaMenuPillar";
import { useClickOutside } from "@/hook/useClickOutside";

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
          {categories.map((cat) => (
            <li key={cat.id}>
              <a className="dropdown">
                <span className="menu-icn flaticon-developer" />
                <span className="menu-title">{cat.label}</span>
              </a>
              <div className="drop-menu d-flex justify-content-between">
                <MegaMenuPillar />
                <MegaMenuPillar />
                <MegaMenuPillar />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
