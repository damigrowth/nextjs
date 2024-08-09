import React from "react";
import VerifiedBadge from "./VerifiedBadge";
import TopLevelBadge from "./TopLevelBadge";

export default function Badges({ verified, topLevel }) {
  return (
    <div className="badges">
      <VerifiedBadge verified={verified} />
      <TopLevelBadge topLevel={topLevel} />
    </div>
  );
}
