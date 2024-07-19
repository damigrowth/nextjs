import React from "react";
import Topbar from "../Topbar";
import { serviceSortOptions } from "../options";
import Pagination from "../Pagination";
import { SERVICES_ARCHIVE } from "@/lib/graphql/queries";
import { getData } from "@/lib/client/operations";
import ServiceGrid from "./ServiceGrid";

export default async function Content({ paramsFilters }) {
  const { services } = await getData(SERVICES_ARCHIVE, paramsFilters);
  return (
    <>
      <Topbar
        meta={services?.meta?.pagination}
        single="υπηρεσία"
        plural="υπηρεσίες"
        sortOptions={serviceSortOptions}
      />
      <ServiceGrid services={services?.data} />
      <div className="row mt30">
        <Pagination meta={services?.meta?.pagination} plural="υπηρεσίες" />
      </div>
    </>
  );
}
