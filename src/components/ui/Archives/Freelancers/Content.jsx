import React from "react";
import Topbar from "../Topbar";
import FreelancerGrid from "./FreelancerGrid";
import Pagination from "../Pagination";
import { freelancerSortOptions } from "../options";
import { getData } from "@/lib/client/operations";
import { FREELANCERS_ARCHIVE } from "@/lib/graphql/queries/main/freelancer";

export default async function Content({ paramsFilters, taxonomies }) {
  const { freelancers } = await getData(FREELANCERS_ARCHIVE, paramsFilters);

  return (
    <>
      <Topbar
        meta={freelancers?.meta?.pagination}
        single={
          paramsFilters.type === "company" ? "επιχείρηση" : "επαγγελματίας"
        }
        plural={
          paramsFilters.type === "company" ? "επιχειρήσεις" : "επαγγελματίες"
        }
        sortOptions={freelancerSortOptions}
      />

      <FreelancerGrid
        freelancers={freelancers?.data}
        taxonomies={taxonomies}
        type={paramsFilters.type}
      />

      <div className="row mt30">
        <Pagination
          meta={freelancers?.meta?.pagination}
          plural={
            paramsFilters.type === "company" ? "επιχειρήσεις" : "επαγγελματίες"
          }
        />
      </div>
    </>
  );
}
