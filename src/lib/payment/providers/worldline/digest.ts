import { createHash } from 'crypto';

/**
 * Fixed 46-field order for digest calculation.
 * Verified empirically against Cardlink sandbox (eurocommerce-test).
 * Key: extTokenOptions and extToken go BETWEEN cancelUrl and var1.
 */
const DIGEST_FIELD_ORDER = [
  'version', 'mid', 'lang', 'deviceCategory', 'orderid', 'orderDesc',
  'orderAmount', 'currency', 'payerEmail', 'payerPhone', 'billCountry',
  'billState', 'billZip', 'billCity', 'billAddress', 'weight', 'dimensions',
  'shipCountry', 'shipState', 'shipZip', 'shipCity', 'shipAddress',
  'addFraudScore', 'maxPayRetries', 'reject3dsU', 'payMethod', 'trType',
  'extInstallmentoffset', 'extInstallmentperiod', 'extRecurringfrequency',
  'extRecurringenddate', 'blockScore', 'cssUrl', 'confirmUrl', 'cancelUrl',
  'extTokenOptions', 'extToken',
  'var1', 'var2', 'var3', 'var4', 'var5', 'var6', 'var7', 'var8', 'var9',
] as const;

/**
 * Calculate digest for Cardlink redirect request.
 * Algorithm: base64(sha256(utf8bytes(concat_fields_in_order + sharedSecret)))
 *
 * Uses fixed 46-field order. Missing fields default to empty string.
 */
export function calculateRequestDigest(
  formFields: Record<string, string>,
  sharedSecret: string,
): string {
  const concatenated = DIGEST_FIELD_ORDER.map((k) => formFields[k] || '').join('') + sharedSecret;
  const hash = createHash('sha256').update(concatenated, 'utf8').digest('base64');
  return hash;
}

/**
 * Validate digest from Cardlink response.
 * Uses raw FormData to capture ALL fields Cardlink sends (including var1-var9, etc.)
 * in the exact order they appear in the POST body.
 */
export function validateResponseDigestFromFormData(
  formData: FormData,
  sharedSecret: string,
): boolean {
  const digest = (formData.get('digest') as string) || '';
  const values: string[] = [];

  // FormData.forEach preserves insertion order from the POST body
  formData.forEach((value, key) => {
    if (key !== 'digest') {
      values.push(String(value));
    }
  });

  const concatenated = values.join('') + sharedSecret;
  const calculated = createHash('sha256').update(concatenated, 'utf8').digest('base64');

  return calculated === digest;
}
