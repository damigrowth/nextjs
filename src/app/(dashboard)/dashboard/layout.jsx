import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { getUser } from "@/lib/auth/user";
import React from "react";

export default async function layout({ children }) {
  await getUser();
  return <DashboardLayout>{children}</DashboardLayout>;
}
