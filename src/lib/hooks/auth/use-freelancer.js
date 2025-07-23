import { useAuth } from './useAuth';

/**
 * Custom hook to fetch freelancer data
 * Now uses Better Auth instead of direct API calls
 * Maintained for backward compatibility
 */
export function useFreelancer() {
  const auth = useAuth();

  return {
    // Freelancer data (for backward compatibility)
    freelancer: auth.user ? {
      fid: auth.fid,
      username: auth.username,
      displayName: auth.displayName,
      firstName: auth.firstName,
      lastName: auth.lastName,
      image: auth.image,
      hasAccess: auth.hasAccess,
      isAuthenticated: auth.isAuthenticated,
      isConfirmed: auth.isConfirmed,
      role: auth.role,
      step: auth.step,
      savedServices: auth.savedServices,
      savedFreelancers: auth.savedFreelancers,
    } : null,
    
    isLoading: auth.isLoading,
    
    // Derived values for easy access
    isAuthenticated: auth.isAuthenticated,
    isConfirmed: auth.isConfirmed,
    username: auth.username,
    displayName: auth.displayName,
    firstName: auth.firstName,
    lastName: auth.lastName,
    image: auth.image,
    hasAccess: auth.hasAccess,
    fid: auth.fid,
    savedServices: auth.savedServices,
    savedFreelancers: auth.savedFreelancers,
    
    // Additional role information
    role: auth.role,
    step: auth.step,
    isUser: auth.isUser,
    isFreelancer: auth.isFreelancer,
    isCompany: auth.isCompany,
    isAdmin: auth.isAdmin,
    isProfessional: auth.isProfessional,
    
    // Actions (no longer needed with Better Auth)
    refresh: () => {
      // Better Auth automatically handles session refresh
      console.log('Refresh called - Better Auth handles this automatically');
    },
  };
}
