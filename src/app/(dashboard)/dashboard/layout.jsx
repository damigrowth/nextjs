import React from 'react';

import DashboardLayout from '@/components/layout/layout-dashboard';

export const dynamic = 'force-dynamic';

export const revalidate = 3600;

export default async function layout({ children }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
