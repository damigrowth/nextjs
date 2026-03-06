import { createHash } from 'crypto';
import type { WorldlineResponseParams } from './types';

/**
 * Calculate digest for Cardlink redirect request.
 *
 * Matches the official Cardlink WooCommerce plugin approach:
 * 1. Concatenate ALL form field values (in insertion order)
 * 2. Append shared secret
 * 3. SHA256 → base64
 *
 * The digest field is NOT included in the concatenation.
 * See docs/cardlink/cardlink-redirect-integration.md
 * See https://github.com/cardlink-sa/cardlink-payment-gateway-woocommerce
 *
 * IMPORTANT: Never calculate this client-side — exposes the shared secret.
 */
export function calculateRequestDigest(
  formFields: Record<string, string>,
  sharedSecret: string,
): string {
  // Concatenate all form field values in order (matching PHP implode behavior)
  const concatenated = Object.values(formFields).join('') + sharedSecret;

  // Temporary debug logging - remove after testing
  console.log('[Worldline Digest] Field count:', Object.keys(formFields).length);
  console.log('[Worldline Digest] Fields:', Object.keys(formFields).join(', '));
  console.log('[Worldline Digest] Concatenated:', concatenated);

  const hash = createHash('sha256').update(concatenated, 'utf8').digest('base64');
  console.log('[Worldline Digest] Digest:', hash);
  return hash;
}

/**
 * Validate digest from Cardlink response.
 *
 * Matches the official Cardlink WooCommerce plugin approach:
 * Iterate ALL POST fields in order, exclude 'digest', concatenate values + secret.
 */
export function validateResponseDigest(
  params: WorldlineResponseParams,
  sharedSecret: string,
): boolean {
  const excludeKeys = new Set(['digest']);
  const values: string[] = [];

  for (const [key, value] of Object.entries(params)) {
    if (!excludeKeys.has(key)) {
      values.push(value || '');
    }
  }

  const concatenated = values.join('') + sharedSecret;
  const calculated = createHash('sha256').update(concatenated, 'utf8').digest('base64');
  return calculated === params.digest;
}
