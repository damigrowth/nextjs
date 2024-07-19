import React, { Suspense } from "react";
import Sidebar from "../Sidebar";
import Topbar from "../Topbar";
import ServiceCard from "./ServiceCard";
import { inspect } from "@/utils/inspect";
import Price from "./Filters/Price";
import Time from "./Filters/Time";
import Category from "./Filters/Category";
import Verified from "./Filters/Verified";
import { serviceSortOptions } from "../options";
import Pagination from "../Pagination";
import Content from "./Content";
import ContentSkeleton from "./ContentSkeleton";
import BorderSpinner from "../../Spinners/BorderSpinner";

export default function ServicesArchive({
  categories,
  searchParams,
  paramsFilters,
}) {
  const { min, max, time, cat, ver } = searchParams;

  // Remove 'cat_s' from searchParams
  const filteredSearchParams = Object.fromEntries(
    Object.entries(searchParams).filter(([key]) => key !== "cat_s")
  );

  const filters = [
    { heading: "Τιμή", params: [min, max], component: <Price /> },
    { heading: "Χρόνος παράδοσης", params: time, component: <Time /> },
    {
      heading: "Κατηγορία",
      params: cat,
      component: <Category categories={categories} />,
    },
    { heading: "Πιστοποιημένο προφίλ", params: ver, component: <Verified /> },
  ];

  return (
    <>
      <section id="archive" className="pt30 pb90">
        <div className="container">
          <div className="row data-loading-section">
            <div className="col-lg-3">
              <Sidebar filters={filters} />
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
      {/* <ListingSidebarModal1 /> */}
    </>
  );
}
