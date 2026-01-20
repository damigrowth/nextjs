'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Heart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toggleSave } from '@/actions/saved';
import { useSession } from '@/lib/auth/client';

interface SaveButtonProps {
  itemType: 'service' | 'profile';
  itemId: string | number;
  initialSaved?: boolean;
  variant?: 'save' | 'remove';
  className?: string;
  onToggle?: (isSaved: boolean) => void;
}

export default function SaveButton({
  itemType,
  itemId,
  initialSaved = false,
  variant = 'save',
  className = '',
  onToggle,
}: SaveButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();

  const isInDashboard = pathname?.startsWith('/dashboard');

  // Sync internal state with prop changes (e.g., when saved state loads from server)
  useEffect(() => {
    setIsSaved(initialSaved);
  }, [initialSaved]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if user is authenticated
    if (!session?.user) {
      router.push('/login');
      return;
    }

    // Optimistic update
    const previousState = isSaved;
    const newState = !isSaved;
    setIsSaved(newState);

    // Call optional callback immediately for parent optimistic update
    onToggle?.(newState);

    // Background server action
    startTransition(async () => {
      const result = await toggleSave(itemType, itemId);

      if (!result.success) {
        // Revert on error
        setIsSaved(previousState);
        onToggle?.(previousState);
      } else if (result.data) {
        // Update with actual server state
        setIsSaved(result.data.isSaved);
        onToggle?.(result.data.isSaved);

        // Refresh the page if in dashboard/saved to update the list
        if (isInDashboard && pathname?.includes('/saved')) {
          router.refresh();
        }
      }
    });
  };

  const button =
    variant === 'remove' ? (
      <Button
        variant='ghost'
        size='sm'
        className={`h-8 w-8 p-0 rounded-full bg-muted text-gray-500 hover:text-red-500 hover:bg-red-50 ${className}`}
        onClick={handleToggle}
        disabled={isPending}
        aria-label='Διαγραφή'
      >
        <Trash2 className='h-4 w-4' />
      </Button>
    ) : (
      <Button
        variant='ghost'
        size='sm'
        className={`h-8 w-8 p-0 rounded-full ${
          isSaved
            ? 'text-red-500 hover:text-red-600 bg-red-50'
            : 'text-gray-400 hover:text-red-500 bg-muted'
        } ${className}`}
        onClick={handleToggle}
        disabled={isPending}
        aria-label={isSaved ? 'Διαγραφή' : 'Αποθήκευση'}
      >
        <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
      </Button>
    );

  // If variant is 'save', wrap with visibility logic based on saved state
  if (variant === 'save') {
    return (
      <div
        className={`transition-opacity duration-200 ${isSaved ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
      >
        {button}
      </div>
    );
  }

  // For 'remove' variant, return button directly
  return button;
}
