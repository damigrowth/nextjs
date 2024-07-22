import Link from "next/link";
import React from "react";

export default function Tabs({
  parentPathLabel,
  parentPathLink,
  category,
  categories,
  plural,
  searchParams,
}) {
  // Serialize search parameters to a query string
  const queryString = new URLSearchParams(searchParams).toString();

  // Generate the URL with query string
  const generateLink = (path) => {
    return queryString ? `${path}?${queryString}` : path;
  };

  return (
    <section className="categories_list_section overflow-hidden">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="listings_category_nav_list_menu">
              <ul className="mb0 d-flex ps-0">
                <li>
                  <Link
                    href={generateLink(`/${parentPathLink}`)}
                    className={!category ? "active" : ""}
                  >
                    {parentPathLabel}
                  </Link>
                </li>
                {categories.map((cat, index) => (
                  <li key={index}>
                    <Link
                      href={generateLink(
                        `/${parentPathLink}/${cat.attributes.slug}`
                      )}
                      className={
                        category == cat.attributes.slug ? "active" : ""
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
