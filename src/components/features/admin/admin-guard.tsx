import { redirect } from 'next/navigation';
import { ClientAdminGuard } from './client-admin-guard';
import { requireRole } from '@/actions/auth/server';

interface AdminGuardProps {
  children: React.ReactNode;
}

export async function AdminGuard({ children }: AdminGuardProps) {
  // Server-side admin role check using existing auth utilities
  try {
    await requireRole('admin');

    // User is authenticated as admin, now handle API key access client-side
    return <ClientAdminGuard>{children}</ClientAdminGuard>;
  } catch (error) {
    // requireRole should handle redirects, but catch any other errors
    redirect('/login');
  }
}
