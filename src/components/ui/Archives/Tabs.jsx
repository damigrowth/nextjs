"use client";

import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function Tabs({ categories, paramName, heading, plural }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state from search parameters or default value
  const initialParamsValue = searchParams.get(paramName) || "";
  const [selectedValue, setSelectedValue] = useState(initialParamsValue);

  const handleChange = (value, action) => {
    const params = new URLSearchParams(searchParams.toString());

    setSelectedValue(value);

    if (value === "") {
      params.delete(paramName);
    } else {
      params.set(paramName, value);
    }

    router.push(pathname + "?" + params, {
      scroll: false,
    });
  };

  return (
    <section className="categories_list_section overflow-hidden">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="listings_category_nav_list_menu">
              <ul className="mb0 d-flex ps-0">
                <li>
                  <a
                    onClick={() => handleChange("")}
                    className={selectedValue === "" ? "active" : ""}
                    style={{ cursor: "pointer" }}
                  >
                    {heading}
                  </a>
                </li>
                {categories.map((cat, index) => (
                  <li key={index}>
                    <a
                      onClick={() => handleChange(cat.id)}
                      className={selectedValue == cat.id ? "active" : ""}
                      style={{ cursor: "pointer" }}
                    >
                      {plural ? cat.attributes.plural : cat.attributes.label}
                    </a>
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
