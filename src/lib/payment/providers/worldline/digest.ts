import { createHash } from 'crypto';
import type { WorldlineResponseParams } from './types';

/**
 * Calculate digest for Cardlink redirect request.
 * Matches the official WooCommerce plugin approach:
 * - Concatenate ALL form field values in insertion order
 * - Append shared secret
 * - SHA256 + base64
 *
 * The digest field itself is NOT included (it's the result).
 * See: cardlink-sa/cardlink-payment-gateway-woocommerce (implode approach)
 */
export function calculateRequestDigest(
  formFields: Record<string, string>,
  sharedSecret: string,
): string {
  const concatenated = Object.values(formFields).join('') + sharedSecret;
  const hash = createHash('sha256').update(concatenated, 'utf8').digest('base64');
  return hash;
}

/**
 * Validate digest from Cardlink response.
 * Iterates ALL POST fields in order, excludes 'digest', concatenates values + secret.
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
