import Image from "next/image";
import React from "react";
import TooltipTop from "../ui/TooltipTop";

export default function TopLevelBadge({ topLevel }) {
  if (!topLevel) return null;
  return (
    <div id="top-level" className="tooltip-container">
      <div className="top-badge-inline mb-0">
        <Image
          width={22}
          height={22}
          src="/images/top-badge.png"
          alt="top badge"
        />
      </div>
      <TooltipTop anchor="top-level">
        Έχει λάβει εξαιρετικές αξιολογήσεις
      </TooltipTop>
    </div>
  );
}
