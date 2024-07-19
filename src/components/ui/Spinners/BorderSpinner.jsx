"use client";

import React from "react";
import { RotatingLines } from "react-loader-spinner";

export default function BorderSpinner({
  className,
  width,
  height,
  borderWidth,
}) {
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
      {/* <div
        className="spinner-border text-thm"
        style={{
          width: !width ? "3rem" : width,
          height: !height ? "3rem" : height,
          borderWidth: !borderWidth ? "0.3rem" : borderWidth,
        }}
        role="status"
      >
        <span className="sr-only"></span>
      </div> */}
    </div>
  );
}
