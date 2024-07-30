import React, { Suspense } from "react";
import Sidebar from "../Sidebar";
import Price from "./Filters/Price";
import Time from "./Filters/Time";
import Category from "./Filters/Category";
import Verified from "./Filters/Verified";
import Content from "./Content";
import ContentSkeleton from "./ContentSkeleton";
import BorderSpinner from "../../Spinners/BorderSpinner";
import ListingSidebarModal1 from "@/components/modal/ListingSidebarModal1";
import SidebarModal from "../SidebarModal";

export default function ServicesArchive({
  categories,
  searchParams,
  paramsFilters,
  childPath,
}) {
  // Remove 'cat_s' from searchParams
  const filteredSearchParams = Object.fromEntries(
    Object.entries(searchParams).filter(([key]) => key !== "cat_s")
  );

  const filters = [
    {
      heading: "Κατηγορία",
      params: ["cat"],
      childPath,
      component: <Category categories={categories} />,
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
      <section id="archive" className="pt30 pb90">
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
                <Content paramsFilters={paramsFilters} />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
      <SidebarModal filters={filters} searchParams={searchParams} />
    </>
  );
}
