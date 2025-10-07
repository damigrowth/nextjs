import { AdminGuard, AppSidebar, SiteHeader } from '@/components';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <SidebarProvider>
        <AppSidebar variant='inset' />
        <SidebarInset>
          {/* <SiteHeader /> */}
          <div className='flex flex-1 flex-col'>
            <div className='@container/main flex flex-1 flex-col gap-2'>
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AdminGuard>
  );
}
