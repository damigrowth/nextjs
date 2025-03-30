"use client";
import { hasAccessMainNav, noAccessMainNav, hasAccessServicesNav, hasAccessAccountNav, noAccessAccountNav } from "@/data/dashboard";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function DashboardNavigation({ hasAccess }) {
  const [isActive, setActive] = useState(false);
  const path = usePathname();

  const renderNavItem = (item) => {
    // Common class names
    const isActiveClass =
      path === item.path ? "mobile-dasboard-menu-active" : "";
    const commonContent = (
      <>
        <i className={`${item.icon} mr10`} />
        {item.name}
      </>
    );

    // If path is "#", render a div instead of a Link
    if (item.path === "#") {
      return <div className="disabled">{commonContent}</div>;
    }

    // Regular nav items as links
    return <Link href={item.path}>{commonContent}</Link>;
  };

  const mainNav = hasAccess ? hasAccessMainNav : noAccessMainNav;
  const accountNav = hasAccess ? hasAccessAccountNav : noAccessAccountNav;

  return (
    <>
      <div className="dashboard_navigationbar d-block d-lg-none">
        <div className="dropdown">
          <button onClick={() => setActive(!isActive)} className="dropbtn">
            <i className="fa fa-bars pr10" /> Διαχείριση
          </button>
          <ul className={`dropdown-content ${isActive ? "show" : ""}`}>
            {mainNav.map((item, i) => (
              <li
                className={
                  path === item.path ? "mobile-dasboard-menu-active" : ""
                }
                onClick={() => setActive(false)}
                key={i}
              >
                {renderNavItem(item)}
              </li>
            ))}

            {hasAccess && hasAccessServicesNav.map((item, i) => (
              <li
                className={
                  path === item.path ? "mobile-dasboard-menu-active" : ""
                }
                onClick={() => setActive(false)}
                key={i}
              >
                {renderNavItem(item)}
              </li>
            ))}

            {accountNav.map((item, i) => (
              <li
                className={
                  path === item.path ? "mobile-dasboard-menu-active" : ""
                }
                onClick={() => setActive(false)}
                key={i}
              >
                {renderNavItem(item)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
