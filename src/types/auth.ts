// Better Auth types for your application

export interface BetterAuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;

  // Custom fields
  type: number; // 1=USER, 2=FREELANCER, 3=COMPANY
  step: string; // Current step in the auth flow
  confirmed: boolean;
  blocked: boolean;
  onboardingComplete: boolean;

  username?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface BetterAuthSession {
  id: string;
  userId: string;
  expiresAt: Date;
  token: string;
  user: BetterAuthUser;
}

export type UserType = 1 | 2 | 3; // Simple User | Freelancer | Company

// Auth flow steps
export type AuthStep =
  | 'EMAIL_VERIFICATION'
  | 'COMPLETE_PROFILE' // For OAuth users missing info
  | 'ONBOARDING' // For professionals
  | 'DASHBOARD'; // Final step

export interface AuthState {
  user?: BetterAuthUser;
  session?: BetterAuthSession;
  isLoading: boolean;
  isAuthenticated: boolean;

  // User type helpers
  isSimpleUser: boolean;
  isFreelancer: boolean;
  isCompany: boolean;
  isProfessional: boolean;

  // Flow state helpers
  needsEmailVerification: boolean;
  needsProfileCompletion: boolean;
  needsOnboarding: boolean;
  canAccessDashboard: boolean;
  isBlocked: boolean;

  // Current flow step
  currentStep: AuthStep;
}

// Registration interfaces
export interface SimpleUserSignUpData {
  email: string;
  password: string;
  username: string;
  name?: string;
}

export interface ProfessionalSignUpData {
  email: string;
  password: string;
  username: string;
  displayName: string;
  name?: string;
  type: 2 | 3; // Freelancer or Company
}

// OAuth interfaces - for completing profile after Google OAuth
export interface OAuthProfileCompletionData {
  username: string;
  displayName: string;
  type: 2 | 3; // Only for professionals
}

// Onboarding interfaces
export interface OnboardingData {
  firstName: string;
  lastName: string;
  phone?: string;
  city?: string;
  county?: string;
  zipcode?: string;
  tagline?: string;
  description?: string;
  website?: string;
  experience?: number;
  rate?: number;
}

export interface ProfileCreationData extends OnboardingData {
  userId: string;
  type: 'freelancer' | 'company';
}

// Form state interfaces
export interface AuthFormState {
  errors: Record<string, string[]>;
  message: string | null;
  success: boolean;
}

// Auth flow utilities
export interface AuthFlowStep {
  step: AuthStep;
  title: string;
  description: string;
  component: string;
  allowedUserTypes: UserType[];
  isRequired: boolean;
}

// Better Auth client types
export interface SignUpResponse {
  data?: {
    user: BetterAuthUser;
    session: BetterAuthSession;
  };
  error?: {
    message: string;
    code?: string;
  };
}

export interface SignInResponse {
  data?: {
    user: BetterAuthUser;
    session: BetterAuthSession;
  };
  error?: {
    message: string;
    code?: string;
  };
}

// Email verification
export interface EmailVerificationData {
  token: string;
  email: string;
}

// Password reset
export interface PasswordResetData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordData {
  email: string;
}

// User update interfaces
export interface UserUpdateData {
  username?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  type?: UserType;
  step?: AuthStep;
  onboardingComplete?: boolean;
}

// Auth action types for forms
export type AuthAction =
  | 'SIGN_UP'
  | 'SIGN_IN'
  | 'VERIFY_EMAIL'
  | 'COMPLETE_PROFILE'
  | 'ONBOARDING'
  | 'FORGOT_PASSWORD'
  | 'RESET_PASSWORD'
  | 'SIGN_OUT';
