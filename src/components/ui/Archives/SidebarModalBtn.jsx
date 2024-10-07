"use client";

import useArchiveStore from "@/store/archive/archiveStore";
import Image from "next/image";
import React from "react";

export default function SidebarModalBtn({ type }) {
  const { filtersModalHandler } = useArchiveStore();

  if (type === "close") {
    return (
      <div onClick={filtersModalHandler} className="sidebar-close-icon">
        <span className="far fa-times" />
      </div>
    );
  } else {
    return (
      <button
        onClick={filtersModalHandler}
        type="button"
        className="open-btn filter-btn-left mt20"
      >
        <Image
          height={18}
          width={18}
          className="me-2"
          src="/images/icon/all-filter-icon.svg"
          alt="icon"
        />
        Όλα τα φίλτρα
      </button>
    );
  }
}
