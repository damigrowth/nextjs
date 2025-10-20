'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth/client';
import { getUserSavedState } from '@/actions/saved';
import ProfilesHome from './home-profiles';
import { ProfileCardData } from '@/lib/types';

interface ProfilesHomeWrapperProps {
  profiles: ProfileCardData[];
}

export function ProfilesHomeWrapper({ profiles }: ProfilesHomeWrapperProps) {
  const { data: session } = useSession();
  const [savedProfileIds, setSavedProfileIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSavedState() {
      try {
        if (!session?.user?.id) {
          setIsLoading(false);
          return;
        }

        const savedState = await getUserSavedState(session.user.id);
        const idsArray = Array.from(savedState.profileIds);
        setSavedProfileIds(idsArray);
      } catch (error) {
        console.error('Failed to fetch saved state:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSavedState();
  }, [session]);

  return (
    <ProfilesHome profiles={profiles} savedProfileIds={savedProfileIds} />
  );
}
