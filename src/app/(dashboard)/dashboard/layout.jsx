import DashboardLayout from "@/components/dashboard/DashboardLayout";
import React from "react";

export default async function layout({ children }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
