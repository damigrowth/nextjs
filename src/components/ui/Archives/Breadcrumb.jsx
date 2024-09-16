import Link from "next/link";
import React from "react";

export default function Breadcrumb({
  parentPathLabel,
  parentPathLink,
  category,
  subcategory,
  subdivision,
  plural,
}) {
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
                  <Link href={`/${parentPathLink}/${category.slug}`}>
                    {plural ? category.plural : category.label}
                  </Link>
                )}
                {subcategory === subdivision ? (
                  <>
                    {subcategory && (
                      <Link
                        href={`/${parentPathLink}/${category.slug}/${subcategory.slug}`}
                      >
                        {plural ? subcategory.plural : subcategory.label}
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    {subcategory && (
                      <Link
                        href={`/${parentPathLink}/${category.slug}/${subcategory.slug}`}
                      >
                        {plural ? subcategory.plural : subcategory.label}
                      </Link>
                    )}
                    {subdivision && (
                      <div className="archive-breadcrump-active">
                        {plural ? subdivision.plural : subdivision.label}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
