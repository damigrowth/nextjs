/**
 * Draft Indicator Component
 *
 * Shows pending change count in admin header
 * Updates in real-time when localStorage changes
 */

'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { getDraftCount } from '@/lib/taxonomy-drafts';

export function DraftIndicator() {
  const [draftCount, setDraftCount] = useState(0);

  useEffect(() => {
    // Initial count
    const updateCount = () => {
      setDraftCount(getDraftCount());
    };

    updateCount();

    // Listen for storage events (when drafts change in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'taxonomy_drafts' || e.key === null) {
        updateCount();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Poll every 2 seconds for same-tab changes
    // (storage event doesn't fire in same tab)
    const interval = setInterval(updateCount, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  if (draftCount === 0) return null;

  return (
    <Badge variant="secondary" className="gap-1 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500/20">
      <AlertCircle className="h-3 w-3" />
      <span className="font-medium">
        {draftCount} unpublished change{draftCount > 1 ? 's' : ''}
      </span>
    </Badge>
  );
}
