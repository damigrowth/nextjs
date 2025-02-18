import DashboardLayout from "@/components/dashboard/DashboardLayout";
import React from "react";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function layout({ children }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
