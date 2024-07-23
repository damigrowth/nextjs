import React from "react";

export default function VerifiedBadge({ verified, tooltipText }) {
  if (verified === null || verified === false) return null;
  return (
    <div className="tooltip-container">
      <p className="mb-0 fz14">
        <i className="flaticon-success fa-xl text-thm vam fz24 "></i>
      </p>
      <div className="tooltip" style={{ top: "-50px" }}>
        {tooltipText}
      </div>
    </div>
  );
}
