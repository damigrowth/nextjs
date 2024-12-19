"use client";
import { dasboardNavigation } from "@/data/dashboard";
import { logout } from "@/lib/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardSidebar() {
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

  return (
    <div className="dashboard__sidebar d-none d-lg-block">
      <div className="dashboard_sidebar_list">
        {/* Dashboard items */}
        {dasboardNavigation.slice(0, 5).map((item, i) => (
          <div key={i} className="sidebar_list_item mb-1">
            {renderNavItem(item)}
          </div>
        ))}

        {/* Services section */}
        <p className="fz15 fw400 ff-heading pl30 mt30">Υπηρεσίες</p>
        {dasboardNavigation.slice(5, 7).map((item, i) => (
          <div key={i} className="sidebar_list_item mb-1">
            {renderNavItem(item)}
          </div>
        ))}

        {/* Account section */}
        <p className="fz15 fw400 ff-heading pl30 mt30">Λογαριασμός</p>
        {dasboardNavigation.slice(7, 10).map((item, i) => (
          <div key={i} className="sidebar_list_item mb-1">
            {renderNavItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
}
