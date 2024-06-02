"use client";

import React from "react";
import { StickyContainer } from "react-sticky";

export default function StickyWrapper({ children }) {
  return <StickyContainer>{children}</StickyContainer>;
}
