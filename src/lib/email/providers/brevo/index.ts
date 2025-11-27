/**
 * Brevo Email Provider Module
 *
 * Exports all Brevo-related services and types
 */

export { brevoClient } from './client';
export { brevoWorkflowService, BrevoWorkflowService } from './workflows';
export { brevoListManager, BrevoListManagementService } from './list-management';

export type {
  BrevoConfig,
  BrevoSender,
  BrevoRecipient,
  BrevoWorkflowTrigger,
  BrevoWorkflowResponse,
  DoulitsaContactAttributes,
  BrevoAddToListRequest,
  BrevoRemoveFromListRequest,
  BrevoListOperationResponse,
} from './types';

export { BrevoWorkflow, BrevoListId } from './types';