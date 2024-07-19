import React from "react";
import Topbar from "../Topbar";
import FreelancerGrid from "./FreelancerGrid";
import Pagination from "../Pagination";
import { freelancerSortOptions } from "../options";
import { FREELANCERS_ARCHIVE } from "@/lib/graphql/queries";
import { getData } from "@/lib/client/operations";

export default async function Content({ paramsFilters }) {
  const { freelancers } = await getData(FREELANCERS_ARCHIVE, paramsFilters);

  return (
    <>
      <Topbar
        meta={freelancers?.meta?.pagination}
        single="επαγγελματίας"
        plural="επαγγελματίες"
        sortOptions={freelancerSortOptions}
      />

      <FreelancerGrid freelancers={freelancers?.data} />

      <div className="row mt30">
        <Pagination
          meta={freelancers?.meta?.pagination}
          plural="επαγγελματίες"
        />
      </div>
    </>
  );
}
