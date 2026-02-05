'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useSubscriptionSheetStore } from '@/lib/stores/use-subscription-sheet-store';
import PlanComparison from './plan-comparison';
import PricingSelection from './pricing-selection';

/**
 * Global subscription upgrade sheet.
 * Controlled by useSubscriptionSheetStore.
 * Mounted in dashboard layout for access throughout dashboard.
 */
export default function SubscriptionSheet() {
  const { isOpen, panel, triggerReason, close, showPricing, showPlans } =
    useSubscriptionSheetStore();
  const [selectedInterval, setSelectedInterval] = useState<'month' | 'year'>('year');
  const router = useRouter();

  const handleContinue = () => {
    router.push(`/dashboard/checkout?interval=${selectedInterval}`);
    close();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent className='w-full sm:max-w-2xl overflow-y-auto flex flex-col'>
        <SheetHeader>
          <SheetTitle>Αναβάθμιση σε Προωθημένο</SheetTitle>
          <SheetDescription>
            Αυξήστε την ορατότητα του προφίλ σας και ξεκλειδώστε προηγμένες δυνατότητες
          </SheetDescription>
        </SheetHeader>

        <div className='mt-6 flex-1'>
          {panel === 'plans' && (
            <PlanComparison triggerReason={triggerReason} />
          )}
          {panel === 'pricing' && (
            <PricingSelection
              onBack={showPlans}
              selectedInterval={selectedInterval}
              onIntervalChange={setSelectedInterval}
            />
          )}
        </div>

        <SheetFooter className='mt-6 flex-col gap-3 border-t pt-6'>
          <Button
            variant='ghost'
            className='w-full text-muted-foreground'
            onClick={close}
          >
            Όχι τώρα
          </Button>
          {panel === 'plans' && (
            <Button className='w-full' size='lg' onClick={showPricing}>
              Επιλογή Προωθημένου
            </Button>
          )}
          {panel === 'pricing' && (
            <Button className='w-full' size='lg' onClick={handleContinue}>
              Ολοκλήρωση Συνδρομής
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
