"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function UserMenuLink({ item, index }) {
  const path = usePathname();
  return (
    <Link
      key={index}
      className={`dropdown-item ${path === item.path ? "active" : ""} ${
        item.path === "#" ? "disabled" : ""
      }`}
      href={item.path}
    >
      <i className={`${item.icon} mr10`} />
      {item.name}
    </Link>
  );
}
