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

export default function ServicesArchive({
  categories,
  searchParams,
  paramsFilters,
}) {
  const filters = [
    { heading: "Τιμή", component: <Price /> },
    { heading: "Χρόνος παράδοσης", component: <Time /> },
    { heading: "Κατηγορία", component: <Category categories={categories} /> },
    { heading: "Πιστοποιημένο προφίλ", component: <Verified /> },
  ];

  return (
    <>
      <section className="pt30 pb90">
        <div className="container">
          <div className="row">
            <div className="col-lg-3">
              <Sidebar filters={filters} />
            </div>
            <Suspense
              key={JSON.stringify(searchParams)}
              fallback={<ContentSkeleton />}
            >
              <Content paramsFilters={paramsFilters} />
            </Suspense>
          </div>
        </div>
      </section>
      {/* <ListingSidebarModal1 /> */}
    </>
  );
}
