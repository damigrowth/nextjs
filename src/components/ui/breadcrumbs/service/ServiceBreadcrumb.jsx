import Link from "next/link";
import React from "react";
import BreadcrumbButtons from "../freelancer/BreadcrumbButtons";

export default function ServiceBreadcrumb({
  serviceTitle,
  category,
  subcategory,
}) {
  return (
    <section className="breadcumb-section">
      <div className="container">
        <div className="row">
          <div className="col-sm-8 col-lg-10">
            <div className="breadcumb-style1 mb10-xs">
              <div className="breadcumb-list">
                <Link href="/">Αρχική</Link>
                <Link href="/ipiresies">Υπηρεσίες</Link>
                <Link href={`/ipiresies/${category.data.attributes.slug}`}>
                  {category.data.attributes.label}
                </Link>
                {subcategory?.data && (
                  <Link
                    href={`/ipiresies/${category.data.attributes.slug}/${subcategory.data.attributes.slug}`}
                  >
                    {subcategory.data.attributes.label}
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div className="col-sm-4 col-lg-2">
            <div className="d-flex align-items-center justify-content-sm-end">
              <BreadcrumbButtons serviceTitle={serviceTitle} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
