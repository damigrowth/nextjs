"use client";

import React from "react";
import ReactJson from "react-json-view";

export default function JsonViewer(data) {
  return <ReactJson src={data} collapsed={true} />;
}
