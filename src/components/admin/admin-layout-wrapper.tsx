'use client';

import { AppSidebar } from '@/components/admin/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import type { NavItem } from '@/actions/admin/helpers';

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
  navItems: NavItem[];
}

export function AdminLayoutWrapper({ children, navItems }: AdminLayoutWrapperProps) {
  return (
    <SidebarProvider>
      <AppSidebar navItems={navItems} variant='inset' />
      <SidebarInset>
        <div className='flex flex-1 flex-col'>
          <div className='@container/main flex flex-1 flex-col gap-2'>
            {children}
          </div>
        </div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}
