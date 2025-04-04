"use client";

import useHomeStore from "@/store/home/homeStore";
import Link from "next/link";
import React from "react";

export default function AllTaxonomiesList({ list, tabIndex }) {
  const { taxonomy } = useHomeStore();
  return (
    <>
      {taxonomy === tabIndex &&
        list.map((tax, i) => (
          <div key={i} className="col">
            <div className="skill-list-style1 mb20">
              <ul className="p-0 mb-0">
                {tax.map((item, i2) => (
                  <li key={i2}>
                    <Link
                      href={`/${
                        item.type
                          ? item.type.data.attributes.slug === "company"
                            ? "companies"
                            : "pros"
                          : "ipiresies"
                      }/${
                        item.plural
                          ? item.category
                            ? item.category.data.attributes.slug +
                              "/" +
                              item.slug
                            : ""
                          : item.slug
                      }`}
                    >
                      {item.plural || item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
    </>
  );
}
