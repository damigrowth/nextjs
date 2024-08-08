"use client";

import React from "react";
import { Tooltip } from "react-tooltip";

export default function TooltipTop({ anchor, children }) {
  return (
    <Tooltip anchorSelect={`#${anchor}`} className="ui-tooltip">
      {children}
    </Tooltip>
  );
}
