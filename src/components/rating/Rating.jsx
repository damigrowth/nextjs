"use client";

import React from "react";
import ReactStars from "react-stars";

export default function Rating({
  count,
  value,
  half,
  size,
  color1,
  color2,
  onChange,
  edit,
}) {
  return (
    <ReactStars
      count={count}
      value={value}
      half={half}
      size={size}
      color1={color1}
      color2={color2}
      onChange={onChange}
      edit={edit}
    />
  );
}
