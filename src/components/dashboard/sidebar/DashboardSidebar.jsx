"use client";
import {
  dashboardNavigation,
  hasAccessAccountNav,
  hasAccessMainNav,
  hasAccessServicesNav,
  noAccessAccountNav,
  noAccessMainNav,
} from "@/data/dashboard";
import { logout } from "@/lib/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardSidebar({ hasAccess }) {
  const path = usePathname();

  const renderNavItem = (item) => {
    // Common class names for styling
    const commonClasses = `items-center ${
      path === item.path ? "-is-active" : ""
    } ${item.path === "#" ? "disabled" : ""}`;

    // Special handling for logout item
    if (item.path === "/logout") {
      return (
        <form action={logout}>
          <button
            type="submit"
            className={`items-center btn ${
              path === item.path ? "-is-active" : ""
            }`}
          >
            <i className={`${item.icon} mr15`} />
            {item.name}
          </button>
        </form>
      );
    }

    // Disabled items rendered as div
    if (item.path === "#") {
      return (
        <div className={commonClasses}>
          <i className={`${item.icon} mr15`} />
          {item.name}
        </div>
      );
    }

    // Regular nav items as links
    return (
      <Link href={item.path} className={commonClasses}>
        <i className={`${item.icon} mr15`} />
        {item.name}
      </Link>
    );
  };

  const mainNav = hasAccess ? hasAccessMainNav : noAccessMainNav;
  const accountNav = hasAccess ? hasAccessAccountNav : noAccessAccountNav;

  return (
    <div className="dashboard__sidebar d-none d-lg-block">
      <div className="dashboard_sidebar_list">
        {mainNav.map((item, i) => (
          <div key={i} className="sidebar_list_item mb-1">
            {renderNavItem(item)}
          </div>
        ))}
        {hasAccess && (
          <>
            <p className="fz15 fw400 ff-heading pl30 mt30">Υπηρεσίες</p>
            {hasAccessServicesNav.map((item, i) => (
              <div key={i} className="sidebar_list_item mb-1">
                {renderNavItem(item)}
              </div>
            ))}
          </>
        )}
        <p className="fz15 fw400 ff-heading pl30 mt30">Λογαριασμός</p>
        {accountNav.map((item, i) => (
          <div key={i} className="sidebar_list_item mb-1">
            {renderNavItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
}
