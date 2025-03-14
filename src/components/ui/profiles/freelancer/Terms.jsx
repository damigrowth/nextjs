"use client";

import { formatDescription } from "@/utils/formatDescription";
import React from "react";

export default function Terms({ heading, text, border }) {
  if (!text) {
    return null;
  } else {
    const formattedDescription = formatDescription(text);

    return (
      <div className="pt50">
        <h4>{heading}</h4>
        <div className="freelancer-description text mb30">
          {formattedDescription}
        </div>
        {border && <hr className="opacity-100 mb60 mt60" />}
      </div>
    );
  }
}
