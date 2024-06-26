"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import React, { useCallback, useEffect, useState, useTransition } from "react";

export default function MoreServicesBtn({ servicesPage, total, count }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname(); // Use the current pathname

  const [isPending, startTransition] = useTransition();
  // Get a new searchParams string by merging the current
  // searchParams with a provided key/value pair
  const createQueryString = useCallback(
    (name, value) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  const handleNewServicesPage = () => {
    const nextPage = servicesPage + 1;
    startTransition(() => {
      router.push(pathname + "?" + createQueryString("services", nextPage), {
        scroll: false,
      });
    });
  };

  if (count >= total) {
    return null; // Hide the button if there are no more pages
  }

  return (
    <div className="pb50">
      <button
        onClick={handleNewServicesPage}
        className="ud-btn btn-dark default-box-shadow2"
      >
        Περισσότερες
        {isPending ? (
          <div className="spinner-border spinner-border-sm ml10" role="status">
            <span className="sr-only"></span>
          </div>
        ) : (
          <i className="fal fa-arrow-down-long"></i>
        )}
      </button>
    </div>
  );
}
