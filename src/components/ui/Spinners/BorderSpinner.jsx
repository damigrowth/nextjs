import React from "react";

export default function BorderSpinner({
  className,
  width,
  height,
  borderWidth,
}) {
  return (
    <div className={className}>
      <div
        className="spinner-border text-thm"
        style={{
          width: !width ? "3rem" : width,
          height: !height ? "3rem" : height,
          borderWidth: !borderWidth ? "0.3rem" : borderWidth,
        }}
        role="status"
      >
        <span className="sr-only"></span>
      </div>
    </div>
  );
}
