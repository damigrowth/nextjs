import Link from "next/link";
import React from "react";
import BreadcrumbButtons from "../freelancer/BreadcrumbButtons";

export default function ServiceBreadcrumb({ serviceTitle, category }) {
  return (
    <section className="breadcumb-section">
      <div className="container">
        <div className="row">
          <div className="col-sm-8 col-lg-10">
            <div className="breadcumb-style1 mb10-xs">
              <div className="breadcumb-list">
                <Link href="/">Αρχική</Link>
                <Link href="/services">Υπηρεσίες</Link>
                <Link href={`/services/${category.data.attributes.slug}`}>
                  {category.data.attributes.label}
                </Link>
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
