"use client";

import dynamic from "next/dynamic";

const NavMenuMobile = dynamic(() => import("./ui/NavMenuMobile"), {
  ssr: false,
});

export default function NavMenuMobileWrapper({ header }) {
  return <NavMenuMobile header={header} />;
}
