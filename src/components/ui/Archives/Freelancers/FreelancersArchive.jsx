import React, { Suspense } from "react";
import Sidebar from "../Sidebar";
import Rate from "./Filters/Rate";
import PaymentMethods from "./Filters/PaymentMethods";
import ContactTypes from "./Filters/ContactTypes";
import Coverage from "./Filters/Coverage";
import Category from "./Filters/Category";
import Specialization from "./Filters/Specialization";
import Experience from "./Filters/Experience";
import Content from "./Content";
import ContentSkeleton from "./ContentSkeleton";
import BorderSpinner from "../../Spinners/BorderSpinner";
import SidebarModal from "../SidebarModal";
import Top from "./Filters/Top";
import Verified from "./Filters/Verified";

export default function FreelancersArchive({
  taxonomies,
  categories,
  counties,
  searchParams,
  paramsFilters,
  childPath,
}) {
  // Remove 'cov_c_s' from searchParams
  const filteredSearchParams = Object.fromEntries(
    Object.entries(searchParams).filter(([key]) => key !== "cov_c_s")
  );

  const filters = [
    {
      heading: "Κατηγορία",
      params: ["cat"],
      childPath,
      component: (
        <Category currCategory={taxonomies.current} categories={categories} />
      ),
    },
    { heading: "Εργατοώρα", params: ["min", "max"], component: <Rate /> },
    {
      heading: "Τρόποι Πληρωμής",
      params: ["pay_m"],
      component: <PaymentMethods />,
    },
    {
      heading: "Τρόποι Επικοινωνίας",
      params: ["con_t"],
      component: <ContactTypes />,
    },
    {
      heading: "Περιοχές Εξυπηρέτησης",
      params: ["cov_o", "cov_c"],
      component: <Coverage counties={counties} />,
    },
    {
      heading: "Κλάδος εξειδίκευσης",
      params: ["spec"],
      component: <Specialization />,
    },
    { heading: "Εμπειρία σε έτη", params: ["exp"], component: <Experience /> },
    {
      heading: "Πιστοποιημένο προφίλ",
      params: ["ver"],
      component: <Verified />,
    },
    { heading: "Top", params: ["top"], component: <Top /> },
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
