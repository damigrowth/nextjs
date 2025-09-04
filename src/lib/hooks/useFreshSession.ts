import { useState, useEffect } from 'react';
import { useSession, getFreshSession } from '@/lib/auth/client';

/**
 * Fresh session hook that automatically uses fresh data for recent users
 * and cached data for established users based on registration time
 */
export function useFreshSession() {
  const { data: session, isPending, error, refetch } = useSession();
  const [freshSession, setFreshSession] = useState(session);
  const [isFreshPending, setIsFreshPending] = useState(false);

  // Get fresh session data when base session changes
  useEffect(() => {
    if (session) {
      setIsFreshPending(true);
      getFreshSession(session)
        .then((result) => {
          setFreshSession(result?.data);
          setIsFreshPending(false);
        })
        .catch((error) => {
          console.error('Fresh session error:', error);
          setFreshSession(session); // Fallback to original session
          setIsFreshPending(false);
        });
    } else {
      setFreshSession(null);
      setIsFreshPending(false);
    }
  }, [session?.user?.id]);

  return {
    data: freshSession,
    isPending: isPending || isFreshPending,
    error,
    refetch,
  };
}