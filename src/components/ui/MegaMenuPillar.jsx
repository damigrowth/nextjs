import Link from "next/link";
import React from "react";

export default function MegaMenuPillar() {
  return (
    <div className="one-third">
      <div className="h6 cat-title">Web &amp; App Design</div>
      <ul className="ps-0 mb40">
        <li>
          <Link href="/">Website Design</Link>
        </li>
        <li>
          <Link href="/">App DesignUX Design</Link>
        </li>
        <li>
          <Link href="/">Landing Page Design</Link>
        </li>
        <li>
          <Link href="/">Icon Design</Link>
        </li>
      </ul>
      <div className="h6 cat-title">Marketing Design</div>
      <ul className="ps-0 mb-0">
        <li>
          <Link href="/">Social Media Design</Link>
        </li>
        <li>
          <Link href="/">Email Design</Link>
        </li>
        <li>
          <Link href="/">Web Banners</Link>
        </li>
        <li>
          <Link href="/">Signage Design</Link>
        </li>
      </ul>
    </div>
  );
}
