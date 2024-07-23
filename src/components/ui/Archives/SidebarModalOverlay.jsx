"use client";

import useArchiveStore from "@/store/archive/archiveStore";
import React from "react";

export default function SidebarModalOverlay() {
  const { filtersModalHandler } = useArchiveStore();
  return (
    <div onClick={filtersModalHandler} className="hiddenbar-body-ovelay" />
  );
}
