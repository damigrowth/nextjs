"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function UserMenuLink({ item }) {
  const path = usePathname();
  const isProfile = item.path.startsWith("/profile/");

  return (
    <Link
      className={`dropdown-item ${path === item.path ? "active" : ""} ${
        item.path === "#" ? "disabled" : ""
      }`}
      href={item.path}
      target={isProfile ? "_blank" : undefined}
      rel={isProfile ? "noopener noreferrer" : undefined}
    >
      <i className={`${item.icon} mr10`} />
      <span>{item.name}</span>
    </Link>
  );
}
