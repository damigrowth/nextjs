'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useSubscriptionSheetStore } from '@/lib/stores/use-subscription-sheet-store';

interface PricingSelectionProps {
  onBack: () => void;
}

type PricingOption = 'monthly' | 'annual';

export default function PricingSelection({ onBack }: PricingSelectionProps) {
  const [selected, setSelected] = useState<PricingOption>('annual');
  const router = useRouter();
  const { close } = useSubscriptionSheetStore();

  const handleContinue = () => {
    // Navigate to checkout page with selected interval
    // (Plan #414 handles the actual Stripe checkout session creation)
    const intervalParam = selected === 'annual' ? 'year' : 'month';
    router.push(`/dashboard/checkout?interval=${intervalParam}`);
    close();
  };

  return (
    <div className='space-y-6'>
      <button
        onClick={onBack}
        className='flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors'
      >
        <ArrowLeft className='size-4' />
        Πίσω στα πακέτα
      </button>

      <div>
        <h3 className='text-lg font-semibold'>Επιλογή χρέωσης</h3>
        <p className='text-sm text-muted-foreground'>
          Επιλέξτε τον τρόπο πληρωμής που σας εξυπηρετεί
        </p>
      </div>

      <div className='space-y-3'>
        {/* Monthly */}
        <Card
          className={cn(
            'cursor-pointer transition-all border-2',
            selected === 'monthly'
              ? 'border-primary bg-primary/5'
              : 'border-muted hover:border-muted-foreground/30',
          )}
          onClick={() => setSelected('monthly')}
        >
          <CardContent className='flex items-center justify-between p-4'>
            <div>
              <p className='font-semibold'>Μηνιαία χρέωση</p>
              <p className='text-sm text-muted-foreground'>
                Ακύρωση οποτεδήποτε
              </p>
            </div>
            <p className='text-xl font-bold'>€20<span className='text-sm font-normal'>/μήνα</span></p>
          </CardContent>
        </Card>

        {/* Annual */}
        <Card
          className={cn(
            'cursor-pointer transition-all border-2 relative',
            selected === 'annual'
              ? 'border-primary bg-primary/5'
              : 'border-muted hover:border-muted-foreground/30',
          )}
          onClick={() => setSelected('annual')}
        >
          <Badge className='absolute -top-2.5 right-4'>3 μήνες δώρο</Badge>
          <CardContent className='flex items-center justify-between p-4'>
            <div>
              <p className='font-semibold'>Ετήσια χρέωση</p>
              <p className='text-sm text-muted-foreground'>
                €180/έτος (εξοικονόμηση €60)
              </p>
            </div>
            <p className='text-xl font-bold'>€15<span className='text-sm font-normal'>/μήνα</span></p>
          </CardContent>
        </Card>
      </div>

      <Button
        className='w-full'
        size='lg'
        onClick={handleContinue}
      >
        Συνέχεια στην πληρωμή
      </Button>
    </div>
  );
}
