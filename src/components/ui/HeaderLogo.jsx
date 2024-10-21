"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function HeaderLogo() {
  const pathName = usePathname();

  return (
    <div className="logos">
      <Link className="header-logo logo1" href="/">
        <Image
          width={133}
          height={40}
          src="/images/doulitsa-logo.svg"
          alt="Doulitsa Logo"
        />
      </Link>
      {pathName === "/" && (
        <Link className="header-logo logo2" href="/">
          <Image
            width={133}
            height={40}
            src="/images/doulitsa-logo.svg"
            alt="Doulitsa Logo"
          />
        </Link>
      )}
    </div>
  );
}
