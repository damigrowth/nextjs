/**
 * Worldline/Cardlink redirect request parameters.
 * All 45 fields in the exact order required for digest calculation.
 * Empty string for omitted fields.
 */
export interface WorldlineRedirectParams {
  version: string;
  mid: string;
  lang: string;
  deviceCategory: string;
  orderid: string;
  orderDesc: string;
  orderAmount: string;
  currency: string;
  payerEmail: string;
  payerPhone: string;
  billCountry: string;
  billState: string;
  billZip: string;
  billCity: string;
  billAddress: string;
  weight: string;
  dimensions: string;
  shipCountry: string;
  shipState: string;
  shipZip: string;
  shipCity: string;
  shipAddress: string;
  addFraudScore: string;
  maxPayRetries: string;
  reject3dsU: string;
  payMethod: string;
  trType: string;
  extInstallmentoffset: string;
  extInstallmentperiod: string;
  extRecurringfrequency: string;
  extRecurringenddate: string;
  blockScore: string;
  cssUrl: string;
  confirmUrl: string;
  cancelUrl: string;
  var1: string;
  var2: string;
  var3: string;
  var4: string;
  var5: string;
  var6: string;
  var7: string;
  var8: string;
  var9: string;
  extTokenOptions: string;
  extToken: string;
}

/**
 * Worldline redirect response parameters (POST to confirmUrl/cancelUrl).
 */
export interface WorldlineResponseParams {
  mid: string;
  orderid: string;
  status: string;
  orderAmount: string;
  currency: string;
  paymentTotal: string;
  message: string;
  riskScore: string;
  payMethod: string;
  txId: string;
  paymentRef: string;
  extToken?: string;
  extTokenPanEnd?: string;
  extTokenExp?: string;
  digest: string;
}

/** Cardlink payment status values */
export type WorldlineStatus = 'AUTHORIZED' | 'CAPTURED' | 'CANCELED' | 'REFUSED' | 'ERROR';
