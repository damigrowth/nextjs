import React from "react";
import Skeleton from "react-loading-skeleton";

export default function FreelancerGridSkeleton() {
  return (
    <div className="row">
      {new Array(9).fill().map((_, i) => (
        <div key={i} className="col-sm-6 col-xl-4">
          <Skeleton
            count={1}
            height={427}
            borderRadius={4}
            style={{ marginBottom: "30px" }}
          />
        </div>
      ))}
    </div>
  );
}
