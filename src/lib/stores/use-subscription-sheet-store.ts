import { create } from 'zustand';

interface SubscriptionSheetState {
  isOpen: boolean;
  /** Which panel is active: 'plans' shows comparison, 'pricing' shows pricing options */
  panel: 'plans' | 'pricing';
  /** Optional context message shown in the sheet (e.g., "Για να προβάλετε υπηρεσίες...") */
  triggerReason: string | null;
  open: (reason?: string) => void;
  close: () => void;
  showPricing: () => void;
  showPlans: () => void;
}

export const useSubscriptionSheetStore = create<SubscriptionSheetState>(
  (set) => ({
    isOpen: false,
    panel: 'plans',
    triggerReason: null,
    open: (reason) =>
      set({ isOpen: true, panel: 'plans', triggerReason: reason || null }),
    close: () =>
      set({ isOpen: false, panel: 'plans', triggerReason: null }),
    showPricing: () => set({ panel: 'pricing' }),
    showPlans: () => set({ panel: 'plans' }),
  }),
);
