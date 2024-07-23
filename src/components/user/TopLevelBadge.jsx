import Image from "next/image";
import React from "react";

export default function TopLevelBadge({ topLevel, tooltipText }) {
  if (!topLevel) return null;
  return (
    <div className="tooltip-container">
      <div className="top-badge-inline mb-0">
        <Image
          width={22}
          height={22}
          src="/images/top-badge.png"
          alt="top badge"
        />
      </div>
      <div className="tooltip" style={{ top: "-95px" }}>
        {tooltipText}
      </div>
    </div>
  );
}
