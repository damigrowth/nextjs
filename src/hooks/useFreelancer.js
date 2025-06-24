import { useEffect, useState, useCallback } from 'react';

/**
 * Custom hook to fetch freelancer data from API
 * Replaces Zustand store with simple direct API calls
 */
export function useFreelancer() {
  const [freelancer, setFreelancer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFreelancer = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/freelancer', { cache: 'no-store' });
      const data = await response.json();
      setFreelancer(data.freelancer);
    } catch (error) {
      console.error('Error fetching freelancer:', error);
      setFreelancer(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFreelancer();
  }, [fetchFreelancer]);

  return {
    // Freelancer data
    freelancer,
    isLoading,
    
    // Derived values for easy access
    isAuthenticated: freelancer?.isAuthenticated || false,
    isConfirmed: freelancer?.isConfirmed || false,
    username: freelancer?.username || null,
    displayName: freelancer?.displayName || null,
    firstName: freelancer?.firstName || null,
    lastName: freelancer?.lastName || null,
    image: freelancer?.image || null,
    hasAccess: freelancer?.hasAccess || false,
    fid: freelancer?.fid || null,
    savedServices: freelancer?.savedServices || [],
    savedFreelancers: freelancer?.savedFreelancers || [],
    
    // Actions
    refresh: fetchFreelancer,
  };
}
