import { redirect } from 'next/navigation';
import { requireRole } from '@/actions/auth/server';

interface AdminGuardProps {
  children: React.ReactNode;
}

export async function AdminGuard({ children }: AdminGuardProps) {
  // Server-side admin role check using existing auth utilities
  try {
    await requireRole('admin');

    // User is authenticated as admin - render children directly
    return <>{children}</>;
  } catch (error) {
    // requireRole should handle redirects, but catch any other errors
    redirect('/login');
  }
}
