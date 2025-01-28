"use client";

import useHomeStore from "@/store/home/homeStore";
import { useRouter } from "next/navigation";
import React from "react";

export default function SearchButton() {
  const router = useRouter();

  const { searchTerm, categorySelect } = useHomeStore();

  const categorySlug = categorySelect?.attributes?.slug;

  const handleSearch = () => {
    if (!categorySlug) {
      router.push(`/ipiresies?search=${searchTerm}`);
    } else {
      router.push(`/ipiresies/${categorySlug}?search=${searchTerm}`);
    }
  };

  return (
    <button
      className="ud-btn btn-dark w-100 bdrs60 h-100"
      type="button"
      onClick={handleSearch}
    >
      Αναζήτηση
    </button>
  );
}
