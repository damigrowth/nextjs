import { createHash } from 'crypto';
import type { WorldlineRedirectParams, WorldlineResponseParams } from './types';

/**
 * Parameter order for digest calculation.
 * Cardlink requires concatenation in this EXACT order.
 * Empty string for omitted fields.
 */
const REDIRECT_PARAM_ORDER: (keyof WorldlineRedirectParams)[] = [
  'version',
  'mid',
  'lang',
  'deviceCategory',
  'orderid',
  'orderDesc',
  'orderAmount',
  'currency',
  'payerEmail',
  'payerPhone',
  'billCountry',
  'billState',
  'billZip',
  'billCity',
  'billAddress',
  'weight',
  'dimensions',
  'shipCountry',
  'shipState',
  'shipZip',
  'shipCity',
  'shipAddress',
  'addFraudScore',
  'maxPayRetries',
  'reject3dsU',
  'payMethod',
  'trType',
  'extInstallmentoffset',
  'extInstallmentperiod',
  'extRecurringfrequency',
  'extRecurringenddate',
  'blockScore',
  'cssUrl',
  'confirmUrl',
  'cancelUrl',
  'var1',
  'var2',
  'var3',
  'var4',
  'var5',
  'var6',
  'var7',
  'var8',
  'var9',
  'extTokenOptions',
  'extToken',
];

/**
 * Parameter order for response digest validation.
 */
const RESPONSE_PARAM_ORDER: (keyof WorldlineResponseParams)[] = [
  'mid',
  'orderid',
  'status',
  'orderAmount',
  'currency',
  'paymentTotal',
  'message',
  'riskScore',
  'payMethod',
  'txId',
  'paymentRef',
  'extToken',
  'extTokenPanEnd',
  'extTokenExp',
];

/**
 * Calculate digest for Cardlink redirect request.
 * Algorithm: base64(sha256(utf8bytes(concat_all_params + sharedSecret)))
 *
 * IMPORTANT: Never calculate this client-side — exposes the shared secret.
 */
export function calculateRequestDigest(
  params: WorldlineRedirectParams,
  sharedSecret: string,
): string {
  const values = REDIRECT_PARAM_ORDER.map((key) => params[key] || '');
  const concatenated = values.join('') + sharedSecret;

  const hash = createHash('sha256').update(concatenated, 'utf8').digest('base64');
  return hash;
}

/**
 * Validate digest from Cardlink response.
 * Independently calculates digest and compares to received value.
 */
export function validateResponseDigest(
  params: WorldlineResponseParams,
  sharedSecret: string,
): boolean {
  const values = RESPONSE_PARAM_ORDER.map((key) => params[key] || '');
  const concatenated = values.join('') + sharedSecret;

  const calculated = createHash('sha256').update(concatenated, 'utf8').digest('base64');
  return calculated === params.digest;
}
