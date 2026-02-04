import { useSubscriptionSheetStore } from '@/lib/stores/use-subscription-sheet-store';

/**
 * Hook to check subscription status and trigger upgrade flow.
 * Used to gate premium features behind subscription.
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

  const openUpgradeSheet = (reason?: string) => {
    open(reason);
  };

  return { openUpgradeSheet };
}
