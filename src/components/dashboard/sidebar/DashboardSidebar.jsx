"use client";
import { dasboardNavigation } from "@/data/dashboard";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardSidebar() {
  const path = usePathname();

  return (
    <>
      <div className="dashboard__sidebar d-none d-lg-block">
        <div className="dashboard_sidebar_list">
          {dasboardNavigation.slice(0, 5).map((item,i) => (
            <div key={ i } className="sidebar_list_item mb-1">
              <Link
                href={item.path}
                className={`items-center ${
                  path === item.path ? "-is-active" : ""
                }`}
              >
                <i className={`${item.icon} mr15`} />
                {item.name}
              </Link>
            </div>
          ))}

          <p className="fz15 fw400 ff-heading pl30 mt30">Υπηρεσίες</p>

          {dasboardNavigation.slice(5, 7).map((item,i) => (
            <div key={ i } className="sidebar_list_item mb-1">
              <Link
                href={item.path}
                className={`items-center ${
                  path === item.path ? "-is-active" : ""
                }`}
              >
                <i className={`${item.icon} mr15`} />
                {item.name}
              </Link>
            </div>
          ))}

          <p className="fz15 fw400 ff-heading pl30 mt30">Λογαριασμός</p>
          {dasboardNavigation.slice(7, 10).map((item,i) => (
            <div key={ i } className="sidebar_list_item mb-1">
              <Link
                href={item.path}
                className={`items-center ${
                  path === item.path ? "-is-active" : ""
                }`}
              >
                <i className={`${item.icon} mr15`} />
                {item.name}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
