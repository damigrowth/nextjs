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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useSubscriptionSheetStore } from '@/lib/stores/use-subscription-sheet-store';
import { usePaymentsAccess } from '@/lib/hooks/use-payments-access';
import { BillingInterval } from '@prisma/client';
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
  const [selectedInterval, setSelectedInterval] = useState<BillingInterval>(BillingInterval.year);
  const router = useRouter();
  const { allowed, reason, testModeBanner, isLoading } = usePaymentsAccess();

  const handleContinue = () => {
    router.push(`/dashboard/checkout?interval=${selectedInterval}`);
    close();
  };

  // Don't render sheet at all if access is denied
  if (!isLoading && !allowed) {
    return null;
  }

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
          {isLoading ? (
            <div className='flex items-center justify-center py-12'>
              <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
            </div>
          ) : (
            <>
              {testModeBanner && (
                <Alert className='bg-amber-50 border-amber-200 text-amber-800 mb-6'>
                  <AlertTriangle className='h-4 w-4' />
                  <AlertDescription className='ml-2'>
                    {testModeBanner}
                  </AlertDescription>
                </Alert>
              )}

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
            </>
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
            <Button className='w-full' size='lg' onClick={showPricing} disabled={isLoading}>
              Επιλογή Προωθημένου
            </Button>
          )}
          {panel === 'pricing' && (
            <Button className='w-full' size='lg' onClick={handleContinue} disabled={isLoading}>
              Ολοκλήρωση Συνδρομής
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
