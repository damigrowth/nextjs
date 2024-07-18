import React from "react";
import Topbar from "../Topbar";
import { serviceSortOptions } from "../options";
import ServiceCard from "./ServiceCard";
import Pagination from "../Pagination";
import { SERVICES_ARCHIVE } from "@/lib/graphql/queries";
import { getData } from "@/lib/client/operations";

export default async function Content({ paramsFilters }) {
  const { services } = await getData(SERVICES_ARCHIVE, paramsFilters);
  return (
    <div className="col-lg-9">
      <Topbar
        meta={services?.meta?.pagination}
        single="υπηρεσία"
        plural="υπηρεσίες"
        sortOptions={serviceSortOptions}
      />
      <div className="row">
        <div className="col-lg-12">
          {services.data.length > 0 ? (
            services.data.map((service, i) => (
              <div key={i}>
                <ServiceCard service={service} />
              </div>
            ))
          ) : (
            <div>Δεν βρέθηκαν υπηρεσίες</div>
          )}
        </div>
      </div>
      <Pagination meta={services?.meta?.pagination} plural="υπηρεσίες" />
    </div>
  );
}
