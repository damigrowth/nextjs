import React from "react";

export default function VerifiedBadge({ verified, tooltipText }) {
  if (verified === null || verified === false) return null;
  return (
    <div className="tooltip-container">
      <p className="mb-0 fz14 list-inline-item ml15 ml15-sm mb5-sm ml0-xs">
        <i className="flaticon-success fa-xl text-thm vam fz24 me-2"></i>
      </p>
      <div className="tooltip" style={{ top: "-50px" }}>
        {tooltipText}
      </div>
    </div>
  );
}
