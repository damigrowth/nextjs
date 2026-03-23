'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NextLink } from '@/components';
import { useSubscriptionSheetStore } from '@/lib/stores/use-subscription-sheet-store';

interface CreateServiceButtonProps {
  canCreateMore: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Create service button with plan limit gate.
 * Shows upgrade sheet when user has reached max services.
 * Uses the store directly (not useSubscriptionGate) because the limit
 * dialog should always show, even when payments are in test mode.
 */
export default function CreateServiceButton({
  canCreateMore,
  className = '',
  children,
}: CreateServiceButtonProps) {
  const { open } = useSubscriptionSheetStore();

  if (!canCreateMore) {
    return (
      <Button
        className={className}
        onClick={() =>
          open(
            'Έχετε φτάσει το μέγιστο όριο υπηρεσιών για το πλάνο σας.',
          )
        }
      >
        {children || (
          <>
            <Plus className='w-4 h-4 mr-2' />
            Νέα Υπηρεσία
          </>
        )}
      </Button>
    );
  }

  return (
    <Button asChild className={className}>
      <NextLink href='/dashboard/services/create'>
        {children || (
          <>
            <Plus className='w-4 h-4 mr-2' />
            Νέα Υπηρεσία
          </>
        )}
      </NextLink>
    </Button>
  );
}
