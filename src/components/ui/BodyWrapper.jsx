"use client";

import dynamic from "next/dynamic";

const Body = dynamic(() => import("./Body"), {
  ssr: false,
});

export default function BodyWrapper({ children }) {
  return <Body>{children}</Body>;
}
