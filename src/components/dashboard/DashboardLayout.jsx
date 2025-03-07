import React from "react";
import DashboardHeader from "./header/DashboardHeader";
import DashboardSidebar from "./sidebar/DashboardSidebar";
import DashboardWrapper from "./DashboardWrapper";
import { getAccess, getUser, getUserMe } from "@/lib/auth/user";
import DashboardFooter from "./footer/DashboardFooter";
import { getToken } from "@/lib/auth/token";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }) {
  const token = await getToken();

  if (!token) {
    // Use Next.js redirect function directly
    redirect("/login");
  }

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
      <DashboardFooter />
    </>
  );
}
