"use client";

import useArchiveStore from "@/store/archive/archiveStore";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function Body({ children }) {
  const { filtersModalToggled } = useArchiveStore();
  const path = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getBodyClasses = () => {
    if (!mounted) return "";
    
    return `${
      path === "/register" ||
      path === "/register/success" ||
      path == "/email-confirmation" ||
      path === "/login"
        ? "bgc-thm4 mm-wrapper mm-wrapper--position-left-front"
        : ""
    } ${filtersModalToggled ? "menu-hidden-sidebar-content" : ""} ${
      path.startsWith("/dashboard") ? "" : ""
    }`;
  };

  return (
    <body suppressHydrationWarning className={getBodyClasses()}>
      {mounted ? children : null}
    </body>
  );
}
