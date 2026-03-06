import { createHash } from 'crypto';
import type { WorldlineResponseParams } from './types';

/**
 * Fixed 44-field order for digest calculation (params #1-#44 from Cardlink docs).
 * extTokenOptions, extToken, and digest are NOT part of this — they're extra form fields.
 * See docs/cardlink/cardlink-redirect-integration.md
 */
const DIGEST_PARAM_ORDER = [
  'version', 'mid', 'lang', 'deviceCategory', 'orderid', 'orderDesc',
  'orderAmount', 'currency', 'payerEmail', 'payerPhone', 'billCountry',
  'billState', 'billZip', 'billCity', 'billAddress', 'weight', 'dimensions',
  'shipCountry', 'shipState', 'shipZip', 'shipCity', 'shipAddress',
  'addFraudScore', 'maxPayRetries', 'reject3dsU', 'payMethod', 'trType',
  'extInstallmentoffset', 'extInstallmentperiod', 'extRecurringfrequency',
  'extRecurringenddate', 'blockScore', 'cssUrl', 'confirmUrl', 'cancelUrl',
  'var1', 'var2', 'var3', 'var4', 'var5', 'var6', 'var7', 'var8', 'var9',
] as const;

/**
 * Calculate digest for Cardlink redirect request.
 * Algorithm: base64(sha256(utf8bytes(concat_44_fields_in_order + sharedSecret)))
 *
 * Uses the FIXED 44-field order from Cardlink documentation.
 * Fields not present in formFields are treated as empty string.
 * extTokenOptions and extToken are NOT included in the digest.
 *
 * IMPORTANT: Never calculate this client-side — exposes the shared secret.
 */
export function calculateRequestDigest(
  formFields: Record<string, string>,
  sharedSecret: string,
): string {
  const values = DIGEST_PARAM_ORDER.map((key) => formFields[key] || '');
  const concatenated = values.join('') + sharedSecret;

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
