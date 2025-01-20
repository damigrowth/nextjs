"use client";

import { getPathname } from "@/utils/paths";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React from "react";

export default function Tabs({
  parentPathLabel,
  parentPathLink,
  categories,
  plural,
  freelancerCategory,
  serviceCategory,
  categoriesRoute,
}) {
  const pathName = usePathname();
  const category = getPathname(pathName, 1);

  return (
    <section className="categories_list_section overflow-hidden">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="listings_category_nav_list_menu">
              <ul className="mb0 d-flex ps-0">
                <li>
                  <Link
                    href={`/${categoriesRoute ? "categories" : parentPathLink}`}
                    className={!category ? "active" : ""}
                  >
                    {parentPathLabel}
                  </Link>
                </li>
                {categories.map((cat, index) => (
                  <li key={index}>
                    <Link
                      href={`/${
                        categoriesRoute ? "categories" : parentPathLink
                      }/${cat.attributes.slug}`}
                      className={
                        category === cat.attributes.slug ||
                        freelancerCategory === cat.attributes.slug ||
                        serviceCategory === cat.attributes.slug
                          ? "active"
                          : ""
                      }
                    >
                      {plural ? cat.attributes.plural : cat.attributes.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
