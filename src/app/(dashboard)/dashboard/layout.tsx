import { DashboardLayout } from '@/components';
import React from 'react';

export const dynamic = 'force-dynamic';

export const revalidate = 3600;

export default async function layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
