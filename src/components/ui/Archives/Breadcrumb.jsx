import Link from "next/link";
import React from "react";

export default function Breadcrumb({
  parentPathLabel,
  parentPathLink,
  category,
  categories,
  plural,
}) {
  // Find the current category from the array of categories
  const currentCategory = categories.find(
    (cat) => cat.attributes.slug === category
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
                {category && (
                  <div className="archive-breadcrump-active">
                    {plural
                      ? currentCategory.attributes.plural
                      : currentCategory.attributes.label}
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
