import { redirect } from 'next/navigation';
import { requireRole } from '@/actions/shared/auth';
import { ClientAdminGuard } from './client-admin-guard';

interface AdminGuardProps {
  children: React.ReactNode;
}

export async function AdminGuard({ children }: AdminGuardProps) {
  // Server-side admin role check using existing auth utilities
  try {
    await requireRole('admin', '/login');
    
    // User is authenticated as admin, now handle API key access client-side
    return <ClientAdminGuard>{children}</ClientAdminGuard>;
  } catch (error) {
    // requireRole should handle redirects, but catch any other errors
    redirect('/login');
  }
}