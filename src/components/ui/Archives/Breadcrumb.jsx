import Link from "next/link";
import React from "react";
import BreadcrumbButtons from "../breadcrumbs/freelancer/BreadcrumbButtons";
import { getUserId } from "@/lib/auth/user";

export default async function Breadcrumb({
  parentPathLabel,
  parentPathLink,
  category,
  subcategory,
  subdivision,
  plural,
  categoriesRoute,
  subjectTitle,
  id,
  savedStatus,
}) {
  const userId = await getUserId();

  return (
    <section className="breadcumb-section">
      <div className="container">
        <div className="row">
          <div className="col-sm-8 col-lg-10">
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
          {subjectTitle && (
            <div className="col-sm-4 col-lg-2">
              <div className="d-flex align-items-center justify-content-sm-end">
                <BreadcrumbButtons
                  subjectTitle={subjectTitle}
                  id={id}
                  savedStatus={savedStatus}
                  hideSaveButton={userId === null}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
