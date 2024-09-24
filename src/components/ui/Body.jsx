"use client";

import useArchiveStore from "@/store/archive/archiveStore";
import React from "react";

export default function Body({ children, path }) {
  const { filtersModalToggled } = useArchiveStore();

  return (
    <body
      className={`${
        path === "/register" || path === "/login"
          ? "bgc-thm4 mm-wrapper mm-wrapper--position-left-front"
          : ""
      } ${filtersModalToggled ? "menu-hidden-sidebar-content" : ""}`}
    >
      {children}
    </body>
  );
}
