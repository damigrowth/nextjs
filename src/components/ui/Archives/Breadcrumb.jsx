import Link from "next/link";
import React from "react";

export default function Breadcrumb({
  parentPathLabel,
  parentPathLink,
  category,
  subcategory,
  subdivision,
  plural,
  categoriesRoute,
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
                  <Link
                    href={`/${
                      categoriesRoute ? "categories" : parentPathLink
                    }/${category.slug}`}
                  >
                    {plural ? category.plural : category.label}
                  </Link>
                )}
                {subcategory === subdivision ? (
                  <>
                    {subcategory && (
                      <Link
                        href={
                          categoriesRoute
                            ? `/${parentPathLink}/${subcategory.slug}`
                            : `/${parentPathLink}/${category.slug}/${subcategory.slug}`
                        }
                      >
                        {plural ? subcategory.plural : subcategory.label}
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    {subcategory && (
                      <Link
                        href={
                          categoriesRoute
                            ? `/${parentPathLink}/${subcategory.slug}`
                            : `/${parentPathLink}/${category.slug}/${subcategory.slug}`
                        }
                      >
                        {plural ? subcategory.plural : subcategory.label}
                      </Link>
                    )}
                    {subcategory && subdivision && (
                      <Link
                        href={
                          categoriesRoute
                            ? `/${parentPathLink}/${subcategory.slug}/${subdivision.slug}`
                            : `/${parentPathLink}/${category.slug}/${subcategory.slug}`
                        }
                        className="archive-breadcrump-active"
                      >
                        {plural ? subdivision.plural : subdivision.label}
                      </Link>
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
