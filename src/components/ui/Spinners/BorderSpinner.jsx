"use client";

import React from "react";
import { RotatingLines } from "react-loader-spinner";

export default function BorderSpinner({ className }) {
  return (
    <div className={className}>
      <RotatingLines
        visible={true}
        height="60"
        width="60"
        color="grey"
        strokeWidth="4"
        animationDuration="0.65"
        ariaLabel="rotating-lines-loading"
        wrapperStyle={{}}
        wrapperClass=""
      />
    </div>
  );
}
