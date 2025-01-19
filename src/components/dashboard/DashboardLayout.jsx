import React from "react";
import DashboardHeader from "./header/DashboardHeader";
import DashboardSidebar from "./sidebar/DashboardSidebar";
import DashboardWrapper from "./DashboardWrapper";
import { getAccess, getUser } from "@/lib/auth/user";

export default async function DashboardLayout({ children }) {
  const hasAccess = await getAccess(["freelancer", "company"]);

  return (
    <>
      <DashboardHeader />
      <div className="dashboard_content_wrapper">
        <DashboardWrapper>
          <DashboardSidebar hasAccess={hasAccess} />
          <div className="dashboard__main pl0-md">{children}</div>
        </DashboardWrapper>
      </div>
    </>
  );
}
