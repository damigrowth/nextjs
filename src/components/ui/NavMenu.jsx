import Link from "next/link";
import React from "react";

export default function NavMenu() {
  return (
    <ul className="ace-responsive-menu ui-navigation">
      <li className="visible_list menu-active home-menu-parent fw500">
        <Link
          href="/ipiresies"
          className="list-item"
          prefetch={false}
          scroll={false}
        >
          <span>Υπηρεσίες</span>
        </Link>
      </li>
      <li className="visible_list menu-active home-menu-parent fw500">
        <Link
          href="/pros"
          className="list-item"
          prefetch={false}
          scroll={false}
        >
          <span className="title">Επαγγελματίες</span>
        </Link>
      </li>
      <li className="visible_list menu-active home-menu-parent fw500">
        <Link
          href="/companies"
          className="list-item"
          prefetch={false}
          scroll={false}
        >
          <span className="title">Επιχειρήσεις</span>
        </Link>
      </li>
    </ul>
  );
}
