import React from "react";
import Topbar from "../Topbar";
import { serviceSortOptions } from "../options";
import Pagination from "../Pagination";
import { getData } from "@/lib/client/operations";
import ServiceGrid from "./ServiceGrid";
import { SERVICES_ARCHIVE } from "@/lib/graphql/queries/main/service";
import { getFreelancerId } from "@/lib/users/freelancer";

export default async function Content({ paramsFilters, taxonomies }) {
  const { services } = await getData(SERVICES_ARCHIVE, paramsFilters);

  const fid = await getFreelancerId();

  return (
    <>
      <Topbar
        meta={services?.meta?.pagination}
        single="υπηρεσία"
        plural="υπηρεσίες"
        sortOptions={serviceSortOptions}
      />
      <ServiceGrid
        services={services?.data}
        taxonomies={taxonomies}
        fid={fid}
      />
      <div className="row mt30">
        <Pagination meta={services?.meta?.pagination} plural="υπηρεσίες" />
      </div>
    </>
  );
}
