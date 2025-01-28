"use client";

import useArchiveStore from "@/store/archive/archiveStore";
import { usePathname } from "next/navigation";
import React from "react";

export default function Body({ children }) {
  const { filtersModalToggled } = useArchiveStore();
  const path = usePathname();

  return (
    <body
      className={`${
        path === "/register" || path === "/login"
          ? "bgc-thm4 mm-wrapper mm-wrapper--position-left-front"
          : ""
      } ${filtersModalToggled ? "menu-hidden-sidebar-content" : ""} ${
        // path.startsWith("/dashboard") ? "hover-bgc-color" : ""
        path.startsWith("/dashboard") ? "" : ""
      } `}
    >
      {children}
    </body>
  );
}
