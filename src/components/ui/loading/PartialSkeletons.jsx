import "react-loading-skeleton/dist/skeleton.css";

import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

function Box({ children }) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        display: "block",
        lineHeight: 2,
        padding: "1rem",
        marginBottom: "0.5rem",
        width: 200,
        height: 500,
      }}
    >
      {children}
    </div>
  );
}

export default function SkeletonRect() {
  return <Skeleton count={1} height={500} />;
}
