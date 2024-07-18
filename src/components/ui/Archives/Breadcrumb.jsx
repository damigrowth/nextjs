"use client";

import Link from "next/link";
import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function Breadcrumb({
  heading,
  category,
  categories,
  paramName,
  plural,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Find the current category from the array of categories
  const currentCategory =
    categories.find((cat) => Number(cat.id) === category) || "";

  const handleChange = () => {
    console.log("firing");
    const params = new URLSearchParams(searchParams.toString());
    params.delete(paramName);

    router.push(pathname + "?" + params, {
      scroll: false,
    });
  };

  return (
    <section className="breadcumb-section">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="breadcumb-style1">
              <div className="breadcumb-list">
                <Link href="/">Αρχική</Link>
                <a onClick={handleChange}>{heading}</a>
                <a>
                  {plural
                    ? currentCategory?.attributes?.plural
                    : currentCategory?.attributes?.label}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
