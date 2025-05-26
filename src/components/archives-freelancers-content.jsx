import React from "react";
import Topbar from "./topbar";
import FreelancerGrid from "./archives-freelancers-grid";
import Pagination from "./pagination";
import { freelancerSortOptions } from "./ui/Archives/options";
import { getData } from "@/lib/client/operations";
import {
  FREELANCERS_ARCHIVE,
  FREELANCERS_ARCHIVE_WITH_SKILLS,
} from "@/lib/graphql/queries/main/freelancer";

export default async function Content({ paramsFilters, taxonomies }) {
  // Επιλογή του κατάλληλου query ανάλογα με το αν έχουν επιλεγεί skills
  const query =
    paramsFilters.skills && paramsFilters.skills.length > 0
      ? FREELANCERS_ARCHIVE_WITH_SKILLS
      : FREELANCERS_ARCHIVE;

  const { freelancers } = await getData(query, paramsFilters);

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
