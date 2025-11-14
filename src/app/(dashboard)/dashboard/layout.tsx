import { DashboardLayout } from '@/components';
import { Toaster } from '@/components/ui/sonner';
import React from 'react';

// Dashboard requires auth and user-specific data, so it should be dynamic
export const dynamic = 'force-dynamic';

// Remove revalidate as it conflicts with force-dynamic
// export const revalidate = 3600;

export default async function layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DashboardLayout>{children}</DashboardLayout>
      <Toaster />
    </>
  );
}
