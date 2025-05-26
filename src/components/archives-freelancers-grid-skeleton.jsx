import React from "react";
import Skeleton from "react-loading-skeleton";

export default function FreelancerGridSkeleton() {
  return (
    <div className="row">
      {new Array(9).fill().map((_, i) => (
        <div key={i} className="col-sm-6 col-xl-4">
          <Skeleton
            count={1}
            height={352}
            borderRadius={12}
            style={{
              display: "block",
              marginBottom: "10px",
            }}
          />
        </div>
      ))}
    </div>
  );
}
