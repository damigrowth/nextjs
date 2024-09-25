"use client";

import React from "react";
import { usePathname } from "next/navigation";
import useStickyMenu from "@/hook/useStickyMenu";

export default function HeaderStickyWrapper({ children }) {
  const sticky = useStickyMenu(70);
  const pathname = usePathname();

  return (
    <header
      className={`header-nav bg-white ${
        pathname === "/" ? "nav-homepage-style" : ""
      } at-home3 stricky main-menu border-0 ${
        sticky ? "slideInDown stricky-fixed" : "slideIn"
      }`}
    >
      {children}
    </header>
  );
}
