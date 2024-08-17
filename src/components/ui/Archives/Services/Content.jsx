import React from "react";
import Topbar from "../Topbar";
import { serviceSortOptions } from "../options";
import Pagination from "../Pagination";
import { getData } from "@/lib/client/operations";
import ServiceGrid from "./ServiceGrid";
import { SERVICES_ARCHIVE } from "@/lib/graphql/queries/main/service";
import { CATEGORIES } from "@/lib/graphql/queries/main/taxonomies/service";

export default async function Content({ paramsFilters }) {
  const { services } = await getData(SERVICES_ARCHIVE, paramsFilters);
  const { categories } = await getData(CATEGORIES);

  return (
    <>
      <Topbar
        meta={services?.meta?.pagination}
        single="υπηρεσία"
        plural="υπηρεσίες"
        sortOptions={serviceSortOptions}
      />
      <ServiceGrid services={services?.data} categories={categories} />
      <div className="row mt30">
        <Pagination meta={services?.meta?.pagination} plural="υπηρεσίες" />
      </div>
    </>
  );
}
