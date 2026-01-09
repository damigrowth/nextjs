import { AdminGuard } from '@/components/guards';
import { AdminLayoutWrapper } from '@/components/admin/admin-layout-wrapper';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
    </AdminGuard>
  );
}
