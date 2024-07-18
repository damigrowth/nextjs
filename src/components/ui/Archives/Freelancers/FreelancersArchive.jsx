import React, { Suspense } from "react";
import Sidebar from "../Sidebar";
import Rate from "./Filters/Rate";
import PaymentMethods from "./Filters/PaymentMethods";
import ContactTypes from "./Filters/ContactTypes";
import Coverage from "./Filters/Coverage";
import Type from "./Filters/Type";
import Category from "./Filters/Category";
import Specialization from "./Filters/Specialization";
import Experience from "./Filters/Experience";
import Top from "./Filters/Top";
import Content from "./Content";
import ContentSkeleton from "./ContentSkeleton";

export default function FreelancersArchive({
  categories,
  counties,
  searchParams,
  paramsFilters,
}) {
  const filters = [
    { heading: "Εργατοώρα", component: <Rate /> },
    { heading: "Τρόποι Πληρωμής", component: <PaymentMethods /> },
    {
      heading: "Τρόποι Επικοινωνίας",
      component: <ContactTypes />,
    },
    {
      heading: "Περιοχές Εξυπηρέτησης",
      component: <Coverage counties={counties} />,
    },
    { heading: "Τύπος", component: <Type /> },
    { heading: "Κατηγορία", component: <Category categories={categories} /> },
    { heading: "Κλάδος εξειδίκευσης", component: <Specialization /> },
    { heading: "Εμπειρία σε έτη", component: <Experience /> },
    { heading: "Top", component: <Top /> },
  ];

  return (
    <>
      <section id="archive" className="pt30 pb90">
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
      {/* <ListingSidebarModal5 /> */}
    </>
  );
}
