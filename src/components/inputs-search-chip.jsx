"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useTransition } from "react";
import Spinner from "./spinner";

export default function SearchChip() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchTerm = searchParams.get("search" || "");

  const [isPending, startTransition] = useTransition();

  if (!searchTerm) return null;

  const handleDelete = () => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("search");
      params.set("page", 1);

      router.replace(pathname + "?" + params.toString(), { scroll: false });
    });
  };

  return (
    <div className="search-chip">
      <span>{searchTerm}</span>
      <span className="search-chip-delete" onClick={handleDelete}>
        {isPending ? (
          <Spinner width={"15px"} height={"15px"} borderWidth={"2px"} />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="icon icon-tabler icon-tabler-x"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            strokeWidth="4"
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        )}
      </span>
    </div>
  );
}
