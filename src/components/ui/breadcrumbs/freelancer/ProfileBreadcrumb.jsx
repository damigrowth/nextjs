import React from "react";
import BreadcrumbButtons from "./BreadcrumbButtons";
import Link from "next/link";

export default function ProfileBreadcrumb({ category }) {
  return (
    <section className="breadcumb-section bg-white">
      <div className="container">
        <div className="row">
          <div className="col-sm-8 col-lg-10">
            <div className="breadcumb-style1 mb10-xs">
              <div className="breadcumb-list">
                <Link href="/">Αρχική</Link>
                <Link href="/freelancers">Επαγγελματίες</Link>
                <Link href={`/freelancers/${category.data.attributes.slug}`}>
                  {category.data.attributes.plural}
                </Link>
              </div>
            </div>
          </div>
          <div className="col-sm-4 col-lg-2">
            <div className="d-flex align-items-center justify-content-sm-end">
              <BreadcrumbButtons />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
