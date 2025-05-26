import React from "react";
import Topbar from "./topbar";
import { serviceSortOptions } from "./ui/Archives/options";
import Pagination from "./pagination";
import { getData } from "@/lib/client/operations";
import ServiceGrid from "./ui/Archives/Services/ServiceGrid";
import {
  SERVICES_ARCHIVE,
  SERVICES_ARCHIVE_WITH_TAGS,
} from "@/lib/graphql/queries/main/service";
import { getFreelancerId } from "@/lib/users/freelancer";

export default async function Content({ paramsFilters, taxonomies }) {
  // Επιλογή του κατάλληλου query ανάλογα με το αν έχουν επιλεγεί tags
  const query =
    paramsFilters.tags && paramsFilters.tags.length > 0
      ? SERVICES_ARCHIVE_WITH_TAGS
      : SERVICES_ARCHIVE;

  const { services } = await getData(query, paramsFilters);

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
