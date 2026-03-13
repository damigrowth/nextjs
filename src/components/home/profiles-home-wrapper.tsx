'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth/client';
import { getUserSavedState } from '@/actions/saved';
import ProfilesHome from './home-profiles';
import type { ArchiveProfileCardData } from '@/lib/types/components';

interface ProfilesHomeWrapperProps {
  profiles: ArchiveProfileCardData[];
}

export function ProfilesHomeWrapper({ profiles }: ProfilesHomeWrapperProps) {
  const { data: session } = useSession();
  const [savedProfileIds, setSavedProfileIds] = useState<string[]>([]);

  useEffect(() => {
    async function fetchSavedState() {
      try {
        if (!session?.user?.id) return;
        const savedState = await getUserSavedState(session.user.id);
        setSavedProfileIds(Array.from(savedState.profileIds));
      } catch (error) {
        console.error('Failed to fetch saved state:', error);
      }
    }

    fetchSavedState();
  }, [session]);

  return (
    <ProfilesHome profiles={profiles} savedProfileIds={savedProfileIds} />
  );
}
