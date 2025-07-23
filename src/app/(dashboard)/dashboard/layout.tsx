import React from 'react';
import { DashboardLayout } from '@/components/features/dashboard';

export const dynamic = 'force-dynamic';

export const revalidate = 3600;

export default async function layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
