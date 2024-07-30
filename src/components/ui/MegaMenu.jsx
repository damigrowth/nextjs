import Link from "next/link";
import React from "react";

function Pillar() {
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

export default function MegaMenu({ categories, staticMenuClass }) {
  return (
    <>
      <div id="mega-menu">
        <a
          className={`btn-mega fw500 ${
            staticMenuClass ? staticMenuClass : ""
          } `}
        >
          <span
            className={`pl30 pl10-xl pr5 fz15 vam flaticon-menu ${
              staticMenuClass ? staticMenuClass : ""
            } `}
          />
          Κατηγορίες
        </a>
        <ul className="menu ps-0">
          {categories.map((cat) => (
            <li key={cat.id}>
              <a className="dropdown">
                <span className="menu-icn flaticon-developer" />
                <span className="menu-title">{cat.label}</span>
              </a>
              <div className="drop-menu d-flex justify-content-between">
                <Pillar />
                <Pillar />
                <Pillar />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
