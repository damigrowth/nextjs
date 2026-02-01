import { AdminGuard } from '@/components/guards';
import { AdminLayoutWrapper } from '@/components/admin/admin-layout-wrapper';
import { getFilteredNavItems } from '@/actions/admin/helpers';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('[ADMIN_LAYOUT] START:', new Date().toISOString());

  // Fetch navigation items at the server layout level
  const navStart = performance.now();
  const { navItems } = await getFilteredNavItems();
  console.log('[ADMIN_LAYOUT] getFilteredNavItems took:', performance.now() - navStart, 'ms');

  console.log('[ADMIN_LAYOUT] END:', new Date().toISOString());

  return (
    <AdminGuard>
      <AdminLayoutWrapper navItems={navItems}>{children}</AdminLayoutWrapper>
    </AdminGuard>
  );
}
