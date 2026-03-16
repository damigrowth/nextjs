'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from '@/lib/auth/client';
import { getUserSavedState } from '@/actions/saved';
import ProfilesHome from './home-profiles';
import type { ArchiveProfileCardData } from '@/lib/types/components';

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface ProfilesHomeWrapperProps {
  profiles: ArchiveProfileCardData[];
}

export function ProfilesHomeWrapper({ profiles }: ProfilesHomeWrapperProps) {
  const { data: session } = useSession();
  const [savedProfileIds, setSavedProfileIds] = useState<string[]>([]);

  // Shuffle profiles client-side so each visit gets a fresh order
  const shuffledProfiles = useMemo(() => shuffleArray(profiles), [profiles]);

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
    <ProfilesHome profiles={shuffledProfiles} savedProfileIds={savedProfileIds} />
  );
}
