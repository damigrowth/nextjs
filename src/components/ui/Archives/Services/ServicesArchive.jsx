import React, { Suspense } from "react";
import Sidebar from "../Sidebar";
import Price from "./Filters/Price";
import Time from "./Filters/Time";
import Category from "./Filters/Category";
import Verified from "./Filters/Verified";
import Content from "./Content";
import ContentSkeleton from "./ContentSkeleton";
import BorderSpinner from "../../Spinners/BorderSpinner";
import SidebarModal from "../SidebarModal";
import Tags from "./Filters/Tags";

export default function ServicesArchive({
  taxonomies,
  searchParams,
  paramsFilters,
  childPath,
  selectData,
  multiSelectData,
}) {
  // Remove 'cat_s' from searchParams
  const filteredSearchParams = Object.fromEntries(
    Object.entries(searchParams).filter(
      ([key]) =>
        key !== "cat_s" &&
        key !== "tags_s" &&
        key !== "tags_p" &&
        key !== "tags_ps" &&
        key !== "cov_c_s" &&
        key !== "covc_p" &&
        key !== "covc_ps" &&
        key !== "cat_p" &&
        key !== "cat_ps"
    )
  );

  const filters = [
    {
      heading: "Κατηγορία",
      params: ["cat"],
      childPath,
      component: <Category selectData={selectData} />,
    },
    {
      heading: "Tags",
      params: ["tags"],
      component: <Tags selectData={multiSelectData} />,
    },
    { heading: "Τιμή", params: ["min", "max"], component: <Price /> },
    { heading: "Χρόνος παράδοσης", params: ["time"], component: <Time /> },
    {
      heading: "Πιστοποιημένο προφίλ",
      params: ["ver"],
      component: <Verified />,
    },
  ];

  return (
    <>
      <section id="archive" className="pt30 pb90 bg-orange">
        <div className="container">
          <div className="row data-loading-section">
            <div className="col-lg-3">
              <Sidebar filters={filters} searchParams={searchParams} />
            </div>
            <div className="col-lg-9 archive-content">
              <BorderSpinner className="archive-content-spinner" />
              <Suspense
                key={JSON.stringify(filteredSearchParams)}
                fallback={<ContentSkeleton />}
              >
                <Content
                  paramsFilters={paramsFilters}
                  taxonomies={taxonomies}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
      <SidebarModal filters={filters} searchParams={searchParams} />
    </>
  );
}
