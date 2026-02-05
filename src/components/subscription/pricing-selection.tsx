'use client';

import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PricingSelectionProps {
  onBack: () => void;
  selectedInterval: 'month' | 'year';
  onIntervalChange: (interval: 'month' | 'year') => void;
}

export default function PricingSelection({
  onBack,
  selectedInterval,
  onIntervalChange,
}: PricingSelectionProps) {
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

      <div className='space-y-4'>
        {/* Annual */}
        <Card
          className={cn(
            'cursor-pointer transition-all border-2 relative',
            selectedInterval === 'year'
              ? 'border-primary bg-primary/5'
              : 'border-muted hover:border-muted-foreground/30',
          )}
          onClick={() => onIntervalChange('year')}
        >
          <Badge
            variant='secondary'
            className='absolute -top-2.5 right-4 hover:bg-secondary'
          >
            3 μήνες δώρο
          </Badge>
          <CardContent className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4'>
            <div>
              <p className='font-semibold'>Ετήσια χρέωση</p>
              <p className='text-sm text-muted-foreground'>
                €180/έτος (εξοικονόμηση €60)
              </p>
            </div>
            <p className='text-xl font-bold'>
              €15<span className='text-sm font-normal'>/μήνα</span>
            </p>
          </CardContent>
        </Card>

        {/* Monthly */}
        <Card
          className={cn(
            'cursor-pointer transition-all border-2',
            selectedInterval === 'month'
              ? 'border-primary bg-primary/5'
              : 'border-muted hover:border-muted-foreground/30',
          )}
          onClick={() => onIntervalChange('month')}
        >
          <CardContent className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4'>
            <div>
              <p className='font-semibold'>Μηνιαία χρέωση</p>
              <p className='text-sm text-muted-foreground'>
                Ακύρωση οποτεδήποτε
              </p>
            </div>
            <p className='text-xl font-bold'>
              €20<span className='text-sm font-normal'>/μήνα</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
