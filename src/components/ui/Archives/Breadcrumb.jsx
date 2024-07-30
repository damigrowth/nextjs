"use client";

import { inspect } from "@/utils/inspect";
import { getPathname } from "@/utils/paths";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function Breadcrumb({
  parentPathLabel,
  parentPathLink,
  categories,
  plural,
}) {
  const pathName = usePathname();
  const category = getPathname(pathName, 1);
  const subcategory = getPathname(pathName, 2);

  // Find the current category from the array of categories
  const currentCategory = categories.find(
    (cat) => cat.attributes.slug === category
  );

  const currentSubcategory =
    currentCategory?.attributes?.subcategories?.data?.find(
      (sub) => sub.attributes.slug === subcategory
    );

  return (
    <section className="breadcumb-section">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="breadcumb-style1">
              <div className="breadcumb-list">
                <Link href="/">Αρχική</Link>
                <Link href={`/${parentPathLink}`}>{parentPathLabel}</Link>
                {currentCategory && (
                  <Link
                    href={`/${parentPathLink}/${currentCategory.attributes.slug}`}
                  >
                    {plural
                      ? currentCategory.attributes.plural
                      : currentCategory.attributes.label}
                  </Link>
                )}
                {currentSubcategory && (
                  <div className="archive-breadcrump-active">
                    {plural
                      ? currentSubcategory.attributes.plural
                      : currentSubcategory.attributes.label}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
