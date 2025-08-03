import React from 'react';
import { DashboardSidebar } from './dashboard-sidebar';
import { DashboardBreadcrumb } from './dashboard-breadcrumb';
import { AuthProvider } from '@/components/providers/auth';
import { getCurrentUser } from '@/actions/auth/server';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import UserMenu from '@/components/menu/menu-user';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get auth data server-side to pass to client components
  const userResult = await getCurrentUser();
  const user = userResult.success ? userResult.data.user : null;
  const profile = userResult.success ? userResult.data.profile : null;
  const session = userResult.success ? userResult.data.session : null;

  return (
    <AuthProvider initialUser={user} initialProfile={profile} initialSession={session}>
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <DashboardBreadcrumb />
            </div>
            <div className="px-4">
              <UserMenu />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthProvider>
  );
}
