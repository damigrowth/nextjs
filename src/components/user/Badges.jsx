import React from "react";
import VerifiedBadge from "./VerifiedBadge";
import TopLevelBadge from "./TopLevelBadge";

export default function Badges({ verified, topLevel }) {
  return (
    <div className="badges">
      <VerifiedBadge verified={verified} tooltipText="Πιστοποιημένος" />
      <TopLevelBadge
        topLevel={topLevel}
        tooltipText="Έχει λάβει εξαιρετικές αξιολογήσεις"
      />
    </div>
  );
}
