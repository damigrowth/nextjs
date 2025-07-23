'use client';

import { useSession } from '@/lib/auth-client';

/**
 * Better Auth hook for client-side authentication
 * Uses Better Auth's built-in useSession hook
 */
export function useAuth() {
  const { data: sessionData, isPending: isLoading } = useSession();
  
  const user = sessionData?.user || null;
  const session = sessionData?.session || null;

  return {
    // Auth state
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    
    // User properties
    username: user?.username || null,
    displayName: user?.displayName || null,
    firstName: user?.firstName || null,
    lastName: user?.lastName || null,
    image: user?.image || null,
    role: user?.role || 'user',
    step: user?.step || 'EMAIL_VERIFICATION',
    
    // Role checks
    isUser: user?.role === 'user',
    isFreelancer: user?.role === 'freelancer',
    isCompany: user?.role === 'company',
    isAdmin: user?.role === 'admin',
    isProfessional: user?.role === 'freelancer' || user?.role === 'company',
    hasAccess: user?.role === 'freelancer' || user?.role === 'company' || user?.role === 'admin',
    
    // Status checks
    isConfirmed: !!user?.confirmed && !!user?.emailVerified,
    needsEmailVerification: user ? !user.emailVerified : false,
    needsOnboarding: user?.step === 'ONBOARDING',
    canAccessDashboard: user ? (
      user.emailVerified && 
      user.confirmed && 
      user.step === 'DASHBOARD' &&
      !user.blocked
    ) : false,
    
    // For backward compatibility with useFreelancer hook
    fid: user?.id || null,
    savedServices: [], // TODO: Implement with Better Auth
    savedFreelancers: [], // TODO: Implement with Better Auth
  };
}

export default useAuth;