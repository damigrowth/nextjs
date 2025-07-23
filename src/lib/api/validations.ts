/**
 * API Validation Schemas - Re-exports from comprehensive validation file
 * This file now imports from the single source of truth for all validations
 */

// Re-export all schemas from the comprehensive validation file
export * from '../validations';

// Re-export with specific names for API usage
export {
  // Auth schemas
  loginSchema,
  registerSchema,
  confirmRegistrationSchema as confirmTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  
  // User schemas  
  updateUserSchema,
  updateOnboardingStepSchema as updateOnboardingSchema,
  userQuerySchema,
  
  // Profile schemas
  createProfileSchema,
  updateProfileSchema,
  profileQuerySchema,
  
  // Service schemas
  createServiceSchema,
  updateServiceSchema,
  serviceQuerySchema,
  
  // Review schemas
  createReviewSchema,
  updateReviewSchema,
  reviewQuerySchema,
  
  // Media schemas
  createMediaSchema as uploadMediaSchema,
  updateMediaSchema,
  mediaQuerySchema,
  
  // Chat schemas
  createChatSchema,
  updateChatSchema as updateChatSchema,
  chatQuerySchema,
  
  // Message schemas
  createMessageSchema as sendMessageSchema,
  updateMessageSchema,
  messageQuerySchema,
  
  // Contact schema
  contactSchema,
  
  // Email schema
  emailSchema_send as sendEmailSchema,
  
  // Parameter schemas
  idParamSchema,
  slugParamSchema,
  roleParamSchema as typeParamSchema,
  
  // Pagination
  paginationSchema,
} from '../validations';
