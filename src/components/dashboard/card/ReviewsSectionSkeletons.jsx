import React from "react";
import ReviewCommentSkeleton from "./ReviewCommentSkeleton";

export function ReceivedReviewsSkeleton() {
  return (
    <>
      <div className="row">
        <div className="col-lg-12 mb30">
          <div className="dashboard_title_area">
            <h2>Αξιολογήσεις που έλαβα</h2>
          </div>
        </div>
      </div>
      <div className="row mb20">
        <div className="col-xl-12">
          <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
            <div className="packages_table table-responsive">
              <div className="navtab-style1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <ReviewCommentSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function GivenReviewsSkeleton() {
  return (
    <>
      <div className="row">
        <div className="col-lg-12 mb30">
          <div className="dashboard_title_area">
            <h2>Αξιολογήσεις που έδωσα</h2>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-xl-12">
          <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
            <div className="packages_table table-responsive">
              <div className="navtab-style1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <ReviewCommentSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
