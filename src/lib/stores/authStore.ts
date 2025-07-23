import { create } from 'zustand';

/**
 * Authentication store types
 */
export type AuthType = 0 | 1 | 2; // 0 = no selection, 1 = user, 2 = professional
export type AuthRole = 2 | 3 | null; // 2 = freelancer, 3 = company, null = not selected
export type ConsentType = boolean | string[];

/**
 * Role option for dropdown selection
 */
export interface RoleOption {
  value: number;
  label: string;
}

/**
 * Authentication store state and actions interface
 */
export interface AuthState {
  // State properties
  /** Initial state object for backward compatibility */
  initialState: Record<string, any>;
  /** Authentication type selection: 0 = none, 1 = user, 2 = professional */
  type: AuthType;
  /** User role selection: 2 = freelancer, 3 = company, null = not selected */
  role: AuthRole;
  /** Current step in the authentication process */
  step: number;
  /** User consent status - can be boolean or array of consent types */
  consent: ConsentType;
  /** Available role options for selection */
  roles: RoleOption[];
  
  // Actions
  /** Set user consent status */
  setConsent: (consent: ConsentType) => void;
  /** Set authentication type */
  setAuthType: (type: AuthType) => void;
  /** Set user role */
  setAuthRole: (role: AuthRole) => void;
  /** Set current step */
  setStep: (step: number) => void;
  /** Reset authentication state to initial values */
  resetAuth: () => void;
}

/**
 * Authentication store using Zustand
 */
const authStore = create<AuthState>((set) => ({
  // Initial state
  initialState: {},
  type: 0, // Keep for backward compatibility: 0 = no selection, 1 = user, 2 = professional
  role: null, // The actual role selection: 2 = freelancer, 3 = company
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
  
  // Actions
  setConsent: (consent: ConsentType) => set({ consent }),
  setAuthType: (payload: AuthType) => set(() => ({ type: payload })),
  setAuthRole: (payload: AuthRole) =>
    set(() => ({
      role: payload,
    })),
  setStep: (step: number) => set({ step }),
  resetAuth: () => set({
    type: 0,
    role: null,
    step: 0,
    consent: false,
    initialState: {},
  }),
}));

/**
 * Helper functions for type-safe auth operations
 */
export const authHelpers = {
  /** Check if user has selected a type */
  hasSelectedType: (type: AuthType): boolean => type > 0,
  
  /** Check if user has selected a role (for professional accounts) */
  hasSelectedRole: (role: AuthRole): boolean => role !== null,
  
  /** Check if user is selecting professional account */
  isProfessionalType: (type: AuthType): boolean => type === 2,
  
  /** Check if user is selecting simple user account */
  isUserType: (type: AuthType): boolean => type === 1,
  
  /** Check if role is freelancer */
  isFreelancerRole: (role: AuthRole): boolean => role === 2,
  
  /** Check if role is company */
  isCompanyRole: (role: AuthRole): boolean => role === 3,
  
  /** Convert role number to string */
  roleToString: (role: AuthRole): string | null => {
    switch (role) {
      case 2: return 'freelancer';
      case 3: return 'company';
      default: return null;
    }
  },
  
  /** Check if consent includes terms */
  hasTermsConsent: (consent: ConsentType): boolean => {
    if (typeof consent === 'boolean') return consent;
    return Array.isArray(consent) && consent.includes('terms');
  }
};

/**
 * Typed hook for using the auth store
 * @example
 * const { type, setAuthType, role, setAuthRole } = useAuthStore();
 */
export const useAuthStore = authStore;

export default authStore;