import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// Import centralized types
import type { AuthType, ProRole, ConsentType } from '@/lib/types/auth';

/**
 * Role option for dropdown selection
 */
export interface RoleOption {
  value: number;
  label: string;
}

/**
 * Registration flow store state and actions interface
 */
export interface RegistrationState {
  // Registration flow state
  /** Initial state object for backward compatibility */
  initialState: Record<string, any>;
  /** Authentication type selection: 0 = none, 1 = user, 2 = professional */
  type: AuthType;
  /** User role selection: 2 = freelancer, 3 = company, null = not selected */
  role: ProRole;
  /** Current step in the registration process */
  step: number;
  /** User consent status - can be boolean or array of consent types */
  consent: ConsentType;
  /** Available role options for selection */
  roles: RoleOption[];

  // Registration flow actions
  /** Set user consent status */
  setConsent: (consent: ConsentType) => void;
  /** Set authentication type */
  setAuthType: (type: AuthType) => void;
  /** Set user role */
  setAuthRole: (role: ProRole) => void;
  /** Set current step */
  setStep: (step: number) => void;
  /** Reset registration state to initial values */
  resetAuth: () => void;
}

/**
 * Registration flow store using Zustand
 */
const registrationStore = create<RegistrationState>()(
  subscribeWithSelector((set, get) => ({
    // Registration flow state
    initialState: {},
    type: 0,
    role: null,
    step: 0,
    consent: false,
    roles: [
      {
        value: 3, // Maps to 'company' role
        label: 'Επιχείρηση',
      },
      {
        value: 2, // Maps to 'freelancer' role
        label: 'Επαγγελματίας',
      },
    ],

    // Registration flow actions
    setConsent: (consent: ConsentType) => set({ consent }),
    setAuthType: (payload: AuthType) => set(() => ({ type: payload })),
    setAuthRole: (payload: ProRole) => set(() => ({ role: payload })),
    setStep: (step: number) => set({ step }),
    resetAuth: () =>
      set({
        type: 0,
        role: null,
        step: 0,
        consent: false,
        initialState: {},
      }),
  })),
);

/**
 * Helper functions for type-safe auth operations
 */
export const authHelpers = {
  /** Check if user has selected a type */
  hasSelectedType: (type: AuthType): boolean => type > 0,

  /** Check if user has selected a role (for professional accounts) */
  hasSelectedRole: (role: ProRole): boolean => role !== null,

  /** Check if user is selecting professional account */
  isProfessionalType: (type: AuthType): boolean => type === 2,

  /** Check if user is selecting simple user account */
  isUserType: (type: AuthType): boolean => type === 1,

  /** Check if role is freelancer */
  isFreelancerRole: (role: ProRole): boolean => role === 2,

  /** Check if role is company */
  isCompanyRole: (role: ProRole): boolean => role === 3,

  /** Convert role number to string */
  roleToString: (role: ProRole): string | null => {
    switch (role) {
      case 2:
        return 'freelancer';
      case 3:
        return 'company';
      default:
        return null;
    }
  },

  /** Check if consent includes terms */
  hasTermsConsent: (consent: ConsentType): boolean => {
    if (typeof consent === 'boolean') return consent;
    return Array.isArray(consent) && consent.includes('terms');
  },
};

/**
 * Main registration store hook
 * @example
 * const { type, setAuthType, role, setAuthRole } = useRegistrationStore();
 */
export const useRegistrationStore = registrationStore;

/**
 * Hook for backward compatibility - maps to useRegistrationStore
 * @deprecated Use useRegistrationStore for clarity
 */
export const useAuthStore = registrationStore;

export default registrationStore;
