"use client";

import { getPathname } from "@/utils/paths";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function Tabs({
  categories,
  plural,
  freelancerCategory,
  serviceCategory,
  categoriesRoute,
  type,
}) {
  const pathName = usePathname();
  const category = getPathname(pathName, 1);

  // Compute parent values directly based on type
  let parentLabel = "Όλες οι κατηγορίες";
  let parentPath = "categories";

  switch (type) {
    case "freelancer":
      parentLabel = "Όλοι οι Επαγγελματίες";
      parentPath = "pros";
      break;
    case "company":
      parentLabel = "Όλες οι Επιχειρήσεις";
      parentPath = "companies";
      break;
    case "user":
      parentLabel = "Όλες οι Κατηγορίες";
      parentPath = "categories";
      break;
    case "service":
      parentLabel = "Όλες οι Κατηγορίες";
      parentPath = "ipiresies";
      break;
    default:
      parentLabel = "Όλες οι Κατηγορίες";
      parentPath = "categories";
      break;
  }

  return (
    <section className="categories_list_section overflow-hidden">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="listings_category_nav_list_menu">
              <ul className="mb0 d-flex ps-0">
                <li>
                  <Link
                    href={`/${categoriesRoute ? "categories" : parentPath}`}
                    className={!category ? "active" : ""}
                  >
                    {parentLabel}
                  </Link>
                </li>
                {categories.map((cat, index) => (
                  <li key={index}>
                    <Link
                      href={`/${categoriesRoute ? "categories" : parentPath}/${
                        cat.attributes.slug
                      }`}
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
