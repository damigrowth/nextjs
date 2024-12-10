import React from "react";
import DashboardHeader from "./header/DashboardHeader";
import DashboardSidebar from "./sidebar/DashboardSidebar";
import DashboardWrapper from "./DashboardWrapper";

export default function DashboardLayout({ children }) {
  return (
    <>
      <DashboardHeader />
      <div className="dashboard_content_wrapper">
        <DashboardWrapper>
          <DashboardSidebar />
          <div className="dashboard__main pl0-md">{children}</div>
        </DashboardWrapper>
      </div>
    </>
  );
}
