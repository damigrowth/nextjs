"use client";

import React from "react";
import Sticky from "react-stickynode";

export default function StickySidebar({ children }) {
  return (
    <div className="col-lg-4 service-sidebar">
      <Sticky enabled={true} top={10} bottomBoundary=".service-sidebar">
        <div className="blog-sidebar ms-lg-auto column">{children}</div>
      </Sticky>
    </div>
  );
}
