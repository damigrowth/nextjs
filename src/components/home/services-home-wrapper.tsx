'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from '@/lib/auth/client';
import { getUserSavedState } from '@/actions/saved';
import ServicesHome from './home-services';
import { ServiceCardData } from '@/lib/types';

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface ServicesHomeWrapperProps {
  mainCategories: Array<{
    id: string;
    label: string;
    slug: string;
  }>;
  servicesByCategory: Record<string, ServiceCardData[]>;
}

export function ServicesHomeWrapper({
  mainCategories,
  servicesByCategory,
}: ServicesHomeWrapperProps) {
  const { data: session } = useSession();
  const [savedServiceIds, setSavedServiceIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Shuffle services client-side so each visit gets a fresh order
  const shuffledServicesByCategory = useMemo(() => {
    const shuffled: Record<string, ServiceCardData[]> = {};
    for (const [key, services] of Object.entries(servicesByCategory)) {
      shuffled[key] = shuffleArray(services);
    }
    return shuffled;
  }, [servicesByCategory]);

  useEffect(() => {
    async function fetchSavedState() {
      try {
        if (!session?.user?.id) {
          setIsLoading(false);
          return;
        }

        const savedState = await getUserSavedState(session.user.id);
        const idsArray = Array.from(savedState.serviceIds);
        setSavedServiceIds(idsArray);
      } catch (error) {
        console.error('Failed to fetch saved state:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSavedState();
  }, [session]);

  return (
    <ServicesHome
      mainCategories={mainCategories}
      servicesByCategory={shuffledServicesByCategory}
      savedServiceIds={savedServiceIds}
    />
  );
}
