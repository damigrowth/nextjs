"use client";

import React from "react";

export default function Description({ heading, text, border }) {
  if (!text) {
    return null;
  } else {
    const formattedDescription = text
      .split("\n")
      .map((text, index) =>
        text.trim() !== "" ? (
          <p key={index}>{text}</p>
        ) : (
          <div key={index} className="line-break"></div>
        )
      );

    return (
      <>
        <h4>{heading}</h4>
        <div className="freelancer-description text mb30">
          {formattedDescription}
        </div>
        {border && <hr className="opacity-100 mb60 mt60" />}
      </>
    );
  }
}
