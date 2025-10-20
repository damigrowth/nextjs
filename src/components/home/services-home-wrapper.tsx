'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth/client';
import { getUserSavedState } from '@/actions/saved';
import ServicesHome from './home-services';
import { ServiceCardData } from '@/lib/types';

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
      servicesByCategory={servicesByCategory}
      savedServiceIds={savedServiceIds}
    />
  );
}
