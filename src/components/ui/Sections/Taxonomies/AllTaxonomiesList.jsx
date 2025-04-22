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
                {tax.map((item, i2) => {
                  // Προσδιορισμός του τύπου (pros, companies, ipiresies)
                  const getItemType = () => {
                    if (item.type) {
                      // Για νέο query format
                      const typeSlug = item.type.data?.attributes?.slug;
                      if (typeSlug === "company") return "companies";
                      if (typeSlug === "freelancer") return "pros";
                    } else {
                      // Για παλιό query format
                      // Αν είναι στην πρώτη καρτέλα (freelancers)
                      if (tabIndex === 0) return "pros";
                      // Αν είναι στη δεύτερη καρτέλα (services)
                      return "ipiresies";
                    }
                  };

                  // Προσδιορισμός του path
                  const getItemPath = () => {
                    const type = getItemType();
                    
                    if (type === "pros" || type === "companies") {
                      if (item.category && item.category.data) {
                        return `${item.category.data.attributes.slug}/${item.slug}`;
                      } 
                      return item.slug;
                    } else {
                      // Για υπηρεσίες
                      return item.slug;
                    }
                  };

                  const type = getItemType();
                  const path = getItemPath();

                  return (
                    <li key={i2}>
                      <Link
                        href={`/${type}/${path}`}
                      >
                        {item.plural || item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ))}
    </>
  );
}
