import React from "react";
import BreadcrumbButtons from "./BreadcrumbButtons";
import Link from "next/link";

export default function ProfileBreadcrumb({ category }) {
  return (
    <section className="breadcumb-section">
      <div className="container">
        <div className="row">
          <div className="col-sm-8 col-lg-10">
            <div className="breadcumb-style1 mb10-xs">
              <div className="breadcumb-list">
                <Link href="/">Αρχική</Link>
                <Link href="/pros">
                  <h2 className="heading-p-gray">Επαγγελματίες</h2>
                </Link>
                <Link href={`/pros/${category.data.attributes.slug}`}>
                  <h2 className="heading-p">
                    {category.data.attributes.plural}
                  </h2>
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
