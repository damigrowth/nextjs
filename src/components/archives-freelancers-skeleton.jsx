import React from "react";
import FreelancerGridSkeleton from "./archives-freelancers-grid-skeleton";
import { freelancerSortOptions } from "./ui/Archives/options";
import SortOptions from "./archives-sort-options";
import Skeleton from "react-loading-skeleton";

export default function ContentSkeleton() {
  return (
    <>
      <div className="row align-items-center mb20">
        <div className="col-md-6">
          <div className="text-center text-md-start">
            <p className="text mb-0 mb10-sm">
              <span className="fw500">
                <Skeleton count={1} height={18} width={115} />
              </span>
            </p>
          </div>
        </div>
        <div className="col-md-6">
          <div className="page_control_shorting d-md-flex align-items-center justify-content-center justify-content-md-end">
            <div className="dropdown-lists d-block d-lg-none me-2 mb10-sm"></div>
            <SortOptions sortOptions={freelancerSortOptions} />
          </div>
        </div>
      </div>
      <FreelancerGridSkeleton />
    </>
  );
}
