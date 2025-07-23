/**
 * Onboarding validation schemas - Re-exports from comprehensive validation file
 * This file now imports from the single source of truth for all validations
 */

// Import the comprehensive onboarding schemas
export {
  onboardingFormSchema as OnboardingFormSchema,
  onboardingFormSchemaWithMedia as OnboardingFormSchemaWithMedia,
} from '../../lib/validations';
