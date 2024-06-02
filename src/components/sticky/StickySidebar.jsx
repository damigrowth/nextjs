"use client";

import React from "react";

export default function StickySidebar({ children }) {
  return (
    <div className="col-lg-4">
      <div className="column">
        <div className="scrollbalance-inner">
          <div className="blog-sidebar ms-lg-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
