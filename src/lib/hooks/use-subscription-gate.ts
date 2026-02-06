import { useSubscriptionSheetStore } from '@/lib/stores/use-subscription-sheet-store';
import { usePaymentsAccess } from './use-payments-access';

/**
 * Hook to check subscription status and trigger upgrade flow.
 * Used to gate premium features behind subscription.
 * Won't open sheet if user doesn't have payment access (test mode).
 *
 * @param reason - Message shown to user explaining why upgrade is needed
 * @returns Object with openUpgradeSheet function
 *
 * @example
 * ```tsx
 * const { openUpgradeSheet } = useSubscriptionGate();
 *
 * const handleFeatureService = async () => {
 *   if (!canFeature) {
 *     openUpgradeSheet('Για να προβάλετε υπηρεσίες, χρειάζεστε το πακέτο Προωθημένο');
 *     return;
 *   }
 *   // ... proceed with feature action
 * };
 * ```
 */
export function useSubscriptionGate() {
  const { open } = useSubscriptionSheetStore();
  const { allowed, isLoading } = usePaymentsAccess();

  const openUpgradeSheet = (reason?: string) => {
    // Don't open sheet if user doesn't have payment access
    if (!isLoading && !allowed) {
      return;
    }
    open(reason);
  };

  return { openUpgradeSheet };
}
