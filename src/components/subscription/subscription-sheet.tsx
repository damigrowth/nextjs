'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
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

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent className='sm:max-w-2xl overflow-y-auto'>
        <SheetHeader>
          <SheetTitle>Αναβάθμιση σε Προωθημένο</SheetTitle>
          <SheetDescription>
            Αυξήστε την ορατότητα του προφίλ σας και ξεκλειδώστε προηγμένες δυνατότητες
          </SheetDescription>
        </SheetHeader>

        <div className='mt-6'>
          {panel === 'plans' && (
            <PlanComparison
              onSelectPromoted={showPricing}
              triggerReason={triggerReason}
            />
          )}
          {panel === 'pricing' && <PricingSelection onBack={showPlans} />}
        </div>
      </SheetContent>
    </Sheet>
  );
}
